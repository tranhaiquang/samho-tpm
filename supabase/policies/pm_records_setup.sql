-- pm_records SETUP for an EMPTY stub table.
-- Drops and recreates pm_records with the schema the PM page expects,
-- plus RLS policies and grants. ONLY use this if the current table has
-- no data (it is an empty stub). Otherwise use pm_records_migration.sql.
-- Paste into the Supabase SQL editor and Run.

drop table if exists public.pm_records;

create table public.pm_records (
  id uuid primary key default gen_random_uuid(),
  item_code text not null,
  plant text,
  pic text[],
  status text not null default 'pending' check (status in ('pending', 'completed', 'validated')),
  due_date date not null,
  technician text[],
  notes text,
  record_type text not null default 'generated' check (record_type in ('generated', 'manual')),
  task_progress text,
  task_validation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (item_code, due_date)
);

alter table public.pm_records enable row level security;

create policy "All authenticated users can view pm_records" on public.pm_records
  for select to authenticated using (true);

create policy "All authenticated users can insert pm_records" on public.pm_records
  for insert to authenticated with check (true);

create policy "All authenticated users can update pm_records" on public.pm_records
  for update to authenticated using (true) with check (true);

create policy "All authenticated users can delete pm_records" on public.pm_records
  for delete to authenticated using (true);

grant select, insert, update, delete on public.pm_records to anon, authenticated;
