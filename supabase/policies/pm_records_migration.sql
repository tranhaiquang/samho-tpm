-- pm_records migration: wire the PM page to the pm_records table.
-- Idempotent: safe to run once (or more) against ANY existing pm_records
-- table, including a bare stub created in the dashboard.
-- Paste into the Supabase SQL editor and Run.

-- 1. Ensure all base columns exist.
alter table public.pm_records
  add column if not exists item_code text not null default '',
  add column if not exists plant text,
  add column if not exists due_date date,
  add column if not exists technician text[],
  add column if not exists notes text,
  add column if not exists record_type text not null default 'generated'
    check (record_type in ('generated', 'manual')),
  add column if not exists task_progress text,
  add column if not exists task_validation text;

-- 1b. Drop columns the app no longer uses (machine name/section are derived
--     from config.machines by item_code; completion time is not tracked).
alter table public.pm_records
  drop column if exists equipment,
  drop column if exists section,
  drop column if exists completed_at;

-- 2. assigned_team -> pic (Person In Charge). Rename if present,
--    otherwise just add the pic column.
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'pm_records' and column_name = 'assigned_team') then
    if not exists (select 1 from information_schema.columns
                   where table_schema = 'public' and table_name = 'pm_records' and column_name = 'pic') then
      alter table public.pm_records rename column assigned_team to pic;
    else
      alter table public.pm_records drop column assigned_team;
    end if;
  elsif not exists (select 1 from information_schema.columns
                    where table_schema = 'public' and table_name = 'pm_records' and column_name = 'pic') then
    alter table public.pm_records add column pic text[];
  end if;
end $$;

-- 3. Replace any status check constraint with the 3-state flow.
do $$
declare c record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.pm_records'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%status%'
  loop
    execute format('alter table public.pm_records drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.pm_records add constraint pm_records_status_check
  check (status in ('pending', 'completed', 'validated'));

-- 4. Dedupe key so re-opening a month never duplicates generated records.
alter table public.pm_records drop constraint if exists pm_records_item_code_due_date_key;
alter table public.pm_records add constraint pm_records_item_code_due_date_key
  unique (item_code, due_date);

-- 5. Timestamps.
alter table public.pm_records
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- 5b. Ensure id auto-generates (the app never sends id).
do $$
begin
  if not exists (
    select 1 from pg_attrdef d
    join pg_attribute a on a.attrelid = d.adrelid and a.attnum = d.adnum
    where a.attrelid = 'public.pm_records'::regclass
      and a.attname = 'id'
  ) then
    alter table public.pm_records alter column id set default gen_random_uuid();
  end if;
end $$;

-- 6. RLS + policies (idempotent; safe if already set up via pm_rls.sql).
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
