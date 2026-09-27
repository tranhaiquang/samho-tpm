-- Samho TPM — Supabase / RLS security audit (READ-ONLY).
-- Run this in the Supabase SQL Editor and paste the results back.
-- It changes nothing: only catalog/policy views are read.
--
-- Why: the anon key is public by design (supabase/config.js, and this repo is a
-- PUBLIC GitHub repo), so every table the anon/authenticated roles can reach is
-- reachable by anyone who copies that key out of the page source.  -- ─────────────────────────────────────────────────────────────────────────── -- 1. Every public table: RLS on/off, policies, and grants.  --    "rls_enabled = false" + any grant to anon  =>  unauthenticated read/write.
--    "policies = (none)" with rls_enabled = true => table is locked (app would
--    read nothing) which usually means the app relies on RLS being OFF.
-- ───────────────────────────────────────────────────────────────────────────
select c.relname                                              as table_name,
       c.relrowsecurity                                       as rls_enabled,
       c.relforcerowsecurity                                  as force_rls,
       coalesce(
         (select string_agg(p.polname || ' {' || p.polcmd || ' ' ||
                            coalesce(array_to_string(p.polroles, ','), 'public') || '}', ', ')
            from pg_policies p
           where p.schemaname = 'public' and p.tablename = c.relname),
         '(no policies)')                                     as policies,
       coalesce(
         (select string_agg(g.grantee || ':' ||
                            array_to_string(g.privilege_type, ','), '  ')
            from information_schema.role_table_grants g
           where g.table_schema = 'public' and g.table_name = c.relname),
         '(no grants)')                                       as grants
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
 where n.nspname = 'public'
   and c.relkind = 'r'
 order by c.relrowsecurity, c.relname;

-- ───────────────────────────────────────────────────────────────────────────
-- 2. Exactly what anon and authenticated can touch (the two roles the browser
--    can obtain). Anything listed for "anon" is world-reachable.
-- ───────────────────────────────────────────────────────────────────────────
select grantee,
       table_name,
       array_to_string(array_agg(privilege_type order by privilege_type), ', ') as privileges
  from information_schema.role_table_grants
 where table_schema = 'public'
   and grantee in ('anon', 'authenticated', 'service_role')
 group by grantee, table_name
 order by grantee, table_name;

-- ───────────────────────────────────────────────────────────────────────────
-- 3. Policies that are effectively wide open (using/with check = true).
--    Not automatically wrong for a shared-data app, but they are the boundary
--    you are relying on — know which tables have them.
-- ───────────────────────────────────────────────────────────────────────────
select schemaname, tablename, policyname, cmd, qual, with_check
  from pg_policies
 where schemaname = 'public'
   and (qual = 'true' or with_check = 'true')
 order by tablename, policyname;

-- ───────────────────────────────────────────────────────────────────────────
-- 4. SECURITY DEFINER functions in public — these run with the owner's rights
--    and can bypass table RLS. Check owner and search_path on every row.
-- ───────────────────────────────────────────────────────────────────────────
select n.nspname                                   as schema,
       p.proname                                    as function,
       pg_get_userbyid(p.proowner)                  as owner,
       array_to_string(p.proconfig, ', ')            as config,
       p.prosecdef                                  as security_definer
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public'
   and p.prosecdef
 order by p.proname;

-- Functions the anon role can execute.
select n.nspname, p.proname, pg_get_userbyid(p.proowner) as owner
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public'
   and has_function_privilege('anon', p.oid, 'execute')
 order by p.proname;

-- ───────────────────────────────────────────────────────────────────────────
-- 5. Storage: bucket visibility vs the storage policies in
--    supabase/policies/spare_part_edit_permissions.sql.
--    A bucket with public = true serves objects to EVERYONE (no auth), which
--    makes any SELECT policy on it meaningless. The app builds
--    /storage/v1/object/public/... URLs (spare_parts.js, incoming_stock.js),
--    so public = true is currently expected — confirm it is deliberate.
-- ───────────────────────────────────────────────────────────────────────────
select id as bucket, public, file_size_limit, allowed_mime_types
  from storage.buckets
 order by id;

select policyname, cmd, array_to_string(roles, ', ') as roles, qual, with_check
  from pg_policies
 where schemaname = 'storage'
 order by tablename, policyname;

-- ───────────────────────────────────────────────────────────────────────────
-- 6. Roles that exist (sanity check that no custom role is over-privileged).
-- ───────────────────────────────────────────────────────────────────────────
select rolname, rolcanlogin, rolbypassrls, rolsuper
  from pg_roles
 where rolname in ('anon', 'authenticated', 'service_role', 'postgres')
 order by rolname;
