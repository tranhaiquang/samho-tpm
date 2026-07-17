-- Run this in the Supabase SQL Editor. It exposes only Auth user display names
-- to authenticated app users for the Mechanic autocomplete.
create or replace function public.list_user_display_names()
returns table (display_name text)
language sql
security definer
set search_path = public, auth
as $$
  select distinct trim(raw_user_meta_data ->> 'display_name')
  from auth.users
  where coalesce(trim(raw_user_meta_data ->> 'display_name'), '') <> ''
  order by 1;
$$;

revoke all on function public.list_user_display_names() from public;
grant execute on function public.list_user_display_names() to authenticated;
