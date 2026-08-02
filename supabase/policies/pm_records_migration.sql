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
create policy "All authenticated users can delete pm_records"
  on public.pm_records for delete to authenticated using (true);
