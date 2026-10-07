-- Samho TPM — close the anon (unauthenticated) attack surface.  READ TH FIRST.
--
-- Run in the Supabase SQL Editor. Idempotent: safe to run more than once.
-- Fixes the two HIGH findings from the 2026-10-07 live probe (visitor key):
--   1. public.list_user_display_names() was executable by anon -> returned all
--      100 employee display names to anyone who copies the publishable key.
--   2. anon still held table grants (DELETE 204 / PATCH 204) on pm_records,
--      repair_records and spare_parts. RLS was the only thing blocking writes.
--
-- Why this is safe for the app: every dashboard page loads assets/js/auth.js,
-- which calls requireAuth() and redirects to login.html without a valid session,
-- and every REST call sends the user's JWT (db_client.js -> SAMHO_AUTH.authHeaders,
-- which overrides Authorization). So no real request runs as "anon" — and the
-- publishable key in supabase/config.js maps to the same anon/authenticated roles.
--
-- Resilience: every statement is wrapped so a MISSING relation cannot abort the
-- transaction (a bare REVOKE on an absent table raises 42P01 and would roll back
-- everything above it — this bit us with public.user_roles, PGRST205).
--
-- Expected result: visitor probes return 401/403; logged-in users are unaffected.

-- ── 1. Lock the user-directory RPC down to signed-in users ──────────────────
-- "from public" also covers anon (anon inherits from public); the explicit anon
-- revoke is belt-and-braces. Both statements must run: the revoke removes the
-- inherited grant from authenticated too, so the grant puts it back.
do $$
begin
  if to_regprocedure('public.list_user_display_names()') is not null then
    execute 'revoke all on function public.list_user_display_names() from public';
    execute 'revoke all on function public.list_user_display_names() from anon';
    execute 'grant execute on function public.list_user_display_names() to authenticated';
  end if;
end $$;

-- ── 2. Drop every table privilege from anon ────────────────────────────────
-- Keep anon able to reach /auth (login) — that is a different role surface and
-- is untouched here.
do $$
declare
  tbl text;
  targets text[] := array[
    'repair_records', 'machine_info', 'pm_records', 'pm_tasks',
    'redtag_records', 'spare_parts', 'spare_part_editors', 'user_roles'
  ];
begin
  foreach tbl in array targets loop
    if to_regclass('public.' || tbl) is not null then
      execute format('revoke all on public.%I from anon', tbl);
    end if;
  end loop;
end $$;

-- ── 3. Verify ──────────────────────────────────────────────────────────────
-- 3a. EXPECT ZERO ROWS. Any row here means anon still holds a table privilege.
select grantee, table_name, array_to_string(array_agg(privilege_type::text order by privilege_type), ', ') as privileges
  from information_schema.role_table_grants
 where table_schema = 'public' and grantee = 'anon'
 group by grantee, table_name
 order by table_name;

-- 3b. EXPECT: authenticated=true, anon=false, public=false.
--     (proconfig carries the search_path set on the function)
select p.prosecdef                                  as security_definer,
       array_to_string(p.proconfig, ', ')           as config,
       has_function_privilege('anon', p.oid, 'execute')          as anon_can_execute,
       has_function_privilege('authenticated', p.oid, 'execute') as authenticated_can_execute,
       has_function_privilege('public', p.oid, 'execute')        as public_can_execute
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public'
   and p.proname = 'list_user_display_names';

-- 3c. OPTIONAL sweep: every public function anon can still execute.
--     Run this to confirm nothing else is exposed like the RPC above was.
select n.nspname as schema, p.proname as function, pg_get_userbyid(p.proowner) as owner
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public'
   and has_function_privilege('anon', p.oid, 'execute')
 order by p.proname;
