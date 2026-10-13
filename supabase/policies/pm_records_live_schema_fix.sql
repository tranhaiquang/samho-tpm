-- pm_records LIVE schema reconciliation.
-- The live pm_records table is missing columns the app writes, causing
-- HTTP 400 on every insert/complete:
--   {"code":"PGRST204","message":"Could not find the 'record_type' column ..."}
-- This file ADDs the missing columns WITHOUT dropping equipment (the app
-- writes it in createPM/editPM) and WITHOUT touching existing data.
-- Idempotent: safe to run once or more. Paste into the Supabase SQL editor and Run.

-- 1. record_type — sent by loadMonthRecords (generated) and createPM (manual).
alter table public.pm_records
  add column if not exists record_type text;

update public.pm_records set record_type = 'generated' where record_type is null;

alter table public.pm_records
  alter column record_type set default 'generated';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.pm_records'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%record_type%'
  ) then
    alter table public.pm_records add constraint pm_records_record_type_check
      check (record_type in ('generated', 'manual'));
  end if;
end $$;

-- 2. technician (text[]) — written by completePM.
alter table public.pm_records add column if not exists technician text[];

-- 3. section (text) — written by createPM.
alter table public.pm_records add column if not exists section text;

-- 4. created_at / updated_at — housekeeping timestamps the schema expects.
alter table public.pm_records add column if not exists created_at timestamptz not null default now();
alter table public.pm_records add column if not exists updated_at timestamptz not null default now();

-- 4b. deleted — soft-delete flag (see pm_records_deleted_flag.sql).
alter table public.pm_records add column if not exists deleted boolean not null default false;
alter table public.pm_records add column if not exists notes text;

-- 5. Dedupe key so re-opening a month never duplicates generated records.
alter table public.pm_records drop constraint if exists pm_records_item_code_due_date_key;
alter table public.pm_records add constraint pm_records_item_code_due_date_key
  unique (item_code, due_date);

-- PM role records are the authoritative authorization source (not client config).
create table if not exists public.user_roles (
  user_id text primary key,
  role text not null check (role in ('pid', 'viewer')),
  created_at timestamptz not null default now()
);
alter table public.user_roles drop constraint if exists user_roles_role_check;
alter table public.user_roles add constraint user_roles_role_check check (role in ('pid', 'validator', 'viewer'));
insert into public.user_roles (user_id, role) values
  ('LEAN TECH', 'pid'), ('LEAD TECH', 'validator'),
  ('25102801', 'validator'), ('21051708', 'validator')
on conflict (user_id) do nothing;
alter table public.user_roles enable row level security;
drop policy if exists "Users can read own role" on public.user_roles;
create policy "Users can read own role" on public.user_roles for select
  to authenticated using (user_id = split_part(auth.jwt() ->> 'email', '@', 1));
grant select on public.user_roles to authenticated;
create or replace function public.is_pm_pid()
returns boolean language sql stable security definer set search_path = pg_catalog, public
as $$ select exists (select 1 from public.user_roles
  where user_id = split_part(auth.jwt() ->> 'email', '@', 1) and role = 'pid'); $$;
revoke all on function public.is_pm_pid() from public, anon;
grant execute on function public.is_pm_pid() to authenticated;
create or replace function public.is_pm_validator()
returns boolean language sql stable security definer set search_path = pg_catalog, public
as $$ select exists (select 1 from public.user_roles
  where user_id = split_part(auth.jwt() ->> 'email', '@', 1) and role in ('pid', 'validator')); $$;
revoke all on function public.is_pm_validator() from public, anon;
grant execute on function public.is_pm_validator() to authenticated;
create or replace function public.guard_pm_schedule_edits()
returns trigger language plpgsql security definer set search_path = pg_catalog, public
as $$ begin
  if not public.is_pm_pid() and (
    old.item_code is distinct from new.item_code or old.plant is distinct from new.plant or
    old.pic is distinct from new.pic or old.due_date is distinct from new.due_date or
    old.notes is distinct from new.notes or old.record_type is distinct from new.record_type or
    old.deleted is distinct from new.deleted
  ) then raise exception 'PID role required to edit or delete a PM schedule' using errcode = '42501'; end if;
  if not public.is_pm_validator() and (
    old.task_validation is distinct from new.task_validation or
    ((old.status = 'validated' or new.status = 'validated') and old.status is distinct from new.status)
  ) then raise exception 'Validator role required to validate PM tasks' using errcode = '42501'; end if;
  return new;
end; $$;
revoke all on function public.guard_pm_schedule_edits() from public, anon, authenticated;
drop trigger if exists guard_pm_schedule_edits on public.pm_records;
create trigger guard_pm_schedule_edits before update on public.pm_records
  for each row execute function public.guard_pm_schedule_edits();

-- 6. RLS + policies (idempotent).
alter table public.pm_records enable row level security;

drop policy if exists "All authenticated users can view pm_records" on public.pm_records;
create policy "All authenticated users can view pm_records"
  on public.pm_records for select to authenticated using (true);

drop policy if exists "All authenticated users can insert pm_records" on public.pm_records;
create policy "All authenticated users can insert pm_records"
  on public.pm_records for insert to authenticated with check (true);

drop policy if exists "All authenticated users can update pm_records" on public.pm_records;
create policy "All authenticated users can update pm_records"
  on public.pm_records for update to authenticated using (true) with check (true);

drop policy if exists "All authenticated users can delete pm_records" on public.pm_records;
drop policy if exists "PID users can delete pm_records" on public.pm_records;
create policy "PID users can delete pm_records"
  on public.pm_records for delete to authenticated using (public.is_pm_pid());

grant select, insert, update, delete on public.pm_records to authenticated;
