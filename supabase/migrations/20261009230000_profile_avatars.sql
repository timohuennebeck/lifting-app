-- Profile photo: a square JPEG in the private "avatars" bucket, under "<user id>/...".
-- The path syncs with the profile, so every device shows the same photo.
alter table public.profiles add column avatar_path text;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do nothing;

create policy "own avatars" on storage.objects for all to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
