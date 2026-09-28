-- Samho TPM — revoke the anon role's DML on application tables.
-- Run in the Supabase SQL Editor AFTER reviewing security_audit.sql output.
--
-- Why this is safe: every dashboard page loads assets/js/auth.js, which calls
-- requireAuth() on load and redirects to login.html without a valid session,
-- and every REST call attaches the user's JWT (db_client.js -> SAMHO_AUTH.authHeaders).
-- So no request the app makes actually runs as "anon" — the grants to anon are
-- dead weight, and the anon key is public (supabase/config.js / public repo).
--
-- The anon role keeps its ability to reach /auth (login) — that is unaffected.
-- Idempotent: safe to run more than once.

revoke all on public.repair_records      from anon;
revoke all on public.machine_info        from anon;
revoke all on public.pm_records          from anon;
revoke all on public.pm_tasks            from anon;
revoke all on public.redtag_records      from anon;
revoke all on public.spare_parts         from anon;
revoke all on public.spare_part_editors  from anon;
-- 2026-09-28: PostgREST reports public.user_roles absent from the schema cache
-- ("Could not find the table"). A bare REVOKE on a missing relation raises
-- 42P01 and would ROLL BACK every revoke above in a single transaction,
-- so guard it — the script must not die on a table that doesn't exist yet.
do $$
begin
  if to_regclass('public.user_roles') is not null then
    execute 'revoke all on public.user_roles from anon';
  end if;
end $$;

-- Verify (expect zero rows for grantee = 'anon'):
select grantee, table_name, array_to_string(array_agg(privilege_type), ', ') as privileges
  from information_schema.role_table_grants
 where table_schema = 'public' and grantee = 'anon'
 group by grantee, table_name
 order by table_name;
