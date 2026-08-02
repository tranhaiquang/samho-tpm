-- pm_records table
create table if not exists public.pm_records (
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

drop policy if exists "All authenticated users can view pm_records" on public.pm_records;
create policy "All authenticated users can view pm_records"
on public.pm_records for select
to authenticated
using (true);

drop policy if exists "All authenticated users can insert pm_records" on public.pm_records;
create policy "All authenticated users can insert pm_records"
on public.pm_records for insert
to authenticated
with check (true);

drop policy if exists "PID users can update pm_records" on public.pm_records;
create policy "PID users can update pm_records"
on public.pm_records for update
to authenticated
using (true)
with check (true);

drop policy if exists "PID users can delete pm_records" on public.pm_records;
create policy "PID users can delete pm_records"
on public.pm_records for delete
to authenticated
using (true);

-- user_roles table
create table if not exists public.user_roles (
  user_id text primary key,
  role text not null check (role in ('pid', 'viewer')),
  created_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;

drop policy if exists "Users can read own role" on public.user_roles;
create policy "Users can read own role"
on public.user_roles for select
to authenticated
using (user_id = split_part(auth.jwt() ->> 'email', '@', 1));