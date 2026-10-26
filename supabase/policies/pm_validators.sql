-- pm_validators table
create table if not exists public.pm_validators (
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
