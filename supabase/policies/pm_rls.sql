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
  deleted boolean not null default false,
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
drop policy if exists "All authenticated users can delete pm_records" on public.pm_records;
create policy "PID users can delete pm_records"
on public.pm_records for delete
to authenticated
using (true);

-- Server-side authorization. Client-side role checks are only for UI display.
create table if not exists public.user_roles (
  user_id text primary key,
  role text not null check (role in ('pid', 'viewer')),
  created_at timestamptz not null default now()
);
alter table public.user_roles enable row level security;
alter table public.user_roles drop constraint if exists user_roles_role_check;
alter table public.user_roles add constraint user_roles_role_check check (role in ('pid', 'validator', 'viewer'));
insert into public.user_roles (user_id, role) values
  ('LEAN TECH', 'pid'),
  ('LEAD TECH', 'validator'),
  ('25102801', 'validator'),
  ('21051708', 'validator')
on conflict (user_id) do nothing;

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

create or replace function public.is_pm_validator()
returns boolean language sql stable security definer set search_path = pg_catalog, public
as $$ select exists (select 1 from public.user_roles
  where user_id = split_part(auth.jwt() ->> 'email', '@', 1) and role in ('pid', 'validator')); $$;
revoke all on function public.is_pm_validator() from public, anon;
grant execute on function public.is_pm_validator() to authenticated;

drop policy if exists "PID users can delete pm_records" on public.pm_records;
create policy "PID users can delete pm_records"
on public.pm_records for delete
to authenticated
using (public.is_pm_pid());

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
    old.record_type is distinct from new.record_type or
    old.deleted is distinct from new.deleted
  ) then
    raise exception 'PID role required to edit or delete a PM schedule'
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

-- user_roles table
create table if not exists public.user_roles (
  user_id text primary key,
  role text not null check (role in ('pid', 'viewer')),
  created_at timestamptz not null default now()
);
alter table public.user_roles drop constraint if exists user_roles_role_check;
alter table public.user_roles add constraint user_roles_role_check check (role in ('pid', 'validator', 'viewer'));

alter table public.user_roles enable row level security;

drop policy if exists "Users can read own role" on public.user_roles;
create policy "Users can read own role"
on public.user_roles for select
to authenticated
using (user_id = split_part(auth.jwt() ->> 'email', '@', 1));
grant select on public.user_roles to authenticated;
