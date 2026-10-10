-- "Delete account" in the settings: removes the signed-in user from auth.users; every table that
-- holds their data references it with on delete cascade. Storage files can't be deleted from SQL,
-- so the app removes the user's folders through the Storage API first.
create function public.delete_own_account()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = (select auth.uid());
$$;

revoke execute on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;
