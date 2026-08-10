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

-- 5. Dedupe key so re-opening a month never duplicates generated records.
alter table public.pm_records drop constraint if exists pm_records_item_code_due_date_key;
alter table public.pm_records add constraint pm_records_item_code_due_date_key
  unique (item_code, due_date);

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
create policy "All authenticated users can delete pm_records"
  on public.pm_records for delete to authenticated using (true);

grant select, insert, update, delete on public.pm_records to anon, authenticated;