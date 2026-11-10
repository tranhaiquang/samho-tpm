-- PM record soft-delete permission: PID **or** validator (was PID-only).
-- Rule (2026-11-10): validators and PID may soft-delete pm_records
-- (both generated month rows and record_type='manual' rows).
-- Schedule-field edits remain PID-only.
--
-- > Run in the Supabase Dashboard -> SQL Editor (they are not applied automatically).
-- Self-contained: also creates the role-check functions if the live DB lacks them
-- (2026-11-10: is_pm_validator() did not exist live -> run this whole file in order).

-- 0a) Role table (idempotent)
create table if not exists public.user_roles (
  user_id text primary key,
  role text not null check (role in ('pid', 'validator', 'viewer')),
  created_at timestamptz not null default now()
);
alter table public.user_roles drop constraint if exists user_roles_role_check;
alter table public.user_roles add constraint user_roles_role_check check (role in ('pid', 'validator', 'viewer'));
alter table public.user_roles enable row level security;
insert into public.user_roles (user_id, role) values
  ('LEAN TECH', 'pid'),
  ('LEAD TECH', 'validator'),
  ('25102801', 'validator'),
  ('21051708', 'validator')
on conflict (user_id) do nothing;
drop policy if exists "Users can read own role" on public.user_roles;
create policy "Users can read own role"
on public.user_roles for select
to authenticated
using (user_id = split_part(auth.jwt() ->> 'email', '@', 1));
grant select on public.user_roles to authenticated;

-- 0b) PID check (idempotent re-create)
create or replace function public.is_pm_pid()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = split_part(auth.jwt() ->> 'email', '@', 1)
      and role = 'pid'
  );
$$;
revoke all on function public.is_pm_pid() from public, anon;
grant execute on function public.is_pm_pid() to authenticated;

-- 0c) pm_validators table (must exist before is_pm_validator() references it)
--     2026-11-10 live drift: the existing table was a stray with only a
--     bigint `id` column (no user data it could hold) -> drop and rebuild
--     in the intended shape, then re-seed the validator IDs.
drop table if exists public.pm_validators cascade;
create table public.pm_validators (
  user_id text primary key,
  display_name text,
  created_at timestamptz not null default now()
);
alter table public.pm_validators enable row level security;
drop policy if exists "Authenticated users can view pm_validators" on public.pm_validators;
create policy "Authenticated users can view pm_validators"
on public.pm_validators for select
to authenticated
using (true);
insert into public.pm_validators (user_id, display_name) values
  ('LEAD TECH', 'LEAD TECH'),
  ('25102801', '25102801'),
  ('21051708', '21051708')
on conflict (user_id) do nothing;

-- 0d) Validator check (the missing one; includes 'pid', and also accepts
--     users listed in pm_validators — the UI treats both as validators)
create or replace function public.is_pm_validator()
returns boolean language sql stable security definer set search_path = pg_catalog, public
as $$
  select
    exists (select 1 from public.user_roles
      where user_id = split_part(auth.jwt() ->> 'email', '@', 1) and role in ('pid', 'validator'))
    or exists (select 1 from public.pm_validators
      where user_id = split_part(auth.jwt() ->> 'email', '@', 1));
$$;
revoke all on function public.is_pm_validator() from public, anon;
grant execute on function public.is_pm_validator() to authenticated;

-- 1) Delete policy: is_pm_validator() already includes 'pid' in its role IN (...) check.
drop policy if exists "PID users can delete pm_records" on public.pm_records;
drop policy if exists "Validators can delete pm_records" on public.pm_records;
create policy "Validators can delete pm_records"
on public.pm_records for delete
to authenticated
using (public.is_pm_validator());

-- 2) Guard trigger: soft-delete goes through UPDATE (deleted=true), so the
--    guard must let validators flip `deleted` while keeping the other
--    schedule fields PID-only. The task_validation check is unchanged.
create or replace function public.guard_pm_schedule_edits()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if not public.is_pm_pid() and (
    old.item_code is distinct from new.item_code or
    old.plant is distinct from new.plant or
    old.pic is distinct from new.pic or
    old.due_date is distinct from new.due_date or
    old.notes is distinct from new.notes or
    old.record_type is distinct from new.record_type
  ) then
    raise exception 'PID role required to edit a PM schedule'
      using errcode = '42501';
  end if;
  if not public.is_pm_validator() and
    old.deleted is distinct from new.deleted
  then
    raise exception 'Validator role required to delete a PM record'
      using errcode = '42501';
  end if;
  if not public.is_pm_validator() and (
    old.task_validation is distinct from new.task_validation or
    ((old.status = 'validated' or new.status = 'validated') and old.status is distinct from new.status)
  ) then
    raise exception 'Validator role required to validate PM tasks'
      using errcode = '42501';
  end if;
  return new;
end;
$$;
revoke all on function public.guard_pm_schedule_edits() from public, anon, authenticated;

drop trigger if exists guard_pm_schedule_edits on public.pm_records;
create trigger guard_pm_schedule_edits
before update on public.pm_records
for each row execute function public.guard_pm_schedule_edits();

-- 3) Verification
select policyname, cmd
from pg_policies
where tablename = 'pm_records'
order by policyname;
