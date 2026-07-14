create table if not exists public.spare_part_editors (
  user_id text primary key,
  email text unique,
  can_edit boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.spare_part_editors enable row level security;

drop policy if exists "Users can read own spare part edit permission" on public.spare_part_editors;
create policy "Users can read own spare part edit permission"
on public.spare_part_editors
for select
to authenticated
using (
  email = auth.jwt() ->> 'email'
  or user_id = split_part(auth.jwt() ->> 'email', '@', 1)
);

drop policy if exists "Spare part editors can update spare parts" on public.spare_parts;
create policy "Spare part editors can update spare parts"
on public.spare_parts
for update
to authenticated
using (
  exists (
    select 1
    from public.spare_part_editors editor
    where (
        editor.email = auth.jwt() ->> 'email'
        or editor.user_id = split_part(auth.jwt() ->> 'email', '@', 1)
      )
  )
)
with check (
  exists (
    select 1
    from public.spare_part_editors editor
    where (
        editor.email = auth.jwt() ->> 'email'
        or editor.user_id = split_part(auth.jwt() ->> 'email', '@', 1)
      )
  )
);

drop policy if exists "Spare part editors can insert spare parts" on public.spare_parts;
create policy "Spare part editors can insert spare parts"
on public.spare_parts
for insert
to authenticated
with check (
  exists (
    select 1
    from public.spare_part_editors editor
    where (
        editor.email = auth.jwt() ->> 'email'
        or editor.user_id = split_part(auth.jwt() ->> 'email', '@', 1)
      )
  )
);

drop policy if exists "Spare part editors can delete spare parts" on public.spare_parts;
create policy "Spare part editors can delete spare parts"
on public.spare_parts
for delete
to authenticated
using (
  exists (
    select 1
    from public.spare_part_editors editor
    where (
      editor.email = auth.jwt() ->> 'email'
      or editor.user_id = split_part(auth.jwt() ->> 'email', '@', 1)
    )
  )
);

drop policy if exists "Spare part editors can read spare part images" on storage.objects;
create policy "Spare part editors can read spare part images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'spare_parts_img'
  and exists (
    select 1
    from public.spare_part_editors editor
    where (
        editor.email = auth.jwt() ->> 'email'
        or editor.user_id = split_part(auth.jwt() ->> 'email', '@', 1)
      )
  )
);

drop policy if exists "Spare part editors can upload spare part images" on storage.objects;
create policy "Spare part editors can upload spare part images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'spare_parts_img'
  and exists (
    select 1
    from public.spare_part_editors editor
    where (
        editor.email = auth.jwt() ->> 'email'
        or editor.user_id = split_part(auth.jwt() ->> 'email', '@', 1)
      )
  )
);

drop policy if exists "Spare part editors can replace spare part images" on storage.objects;
create policy "Spare part editors can replace spare part images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'spare_parts_img'
  and exists (
    select 1
    from public.spare_part_editors editor
    where (
        editor.email = auth.jwt() ->> 'email'
        or editor.user_id = split_part(auth.jwt() ->> 'email', '@', 1)
      )
  )
)
with check (
  bucket_id = 'spare_parts_img'
  and exists (
    select 1
    from public.spare_part_editors editor
    where (
        editor.email = auth.jwt() ->> 'email'
        or editor.user_id = split_part(auth.jwt() ->> 'email', '@', 1)
      )
  )
);

drop policy if exists "Spare part editors can delete spare part images" on storage.objects;
create policy "Spare part editors can delete spare part images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'spare_parts_img'
  and exists (
    select 1
    from public.spare_part_editors editor
    where (
      editor.email = auth.jwt() ->> 'email'
      or editor.user_id = split_part(auth.jwt() ->> 'email', '@', 1)
    )
  )
);
