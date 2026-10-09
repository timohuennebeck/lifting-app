-- The "own rows" policies only check a row's user_id, and foreign keys bypass RLS, so a user
-- could attach rows to another user's parent row by its id. These restrictive policies also
-- require the parent to be the user's own; an optional parent may be null.

do $$
declare r record;
begin
  for r in
    select * from (values
      ('templates', 'collection_id', 'collections'),
      ('template_exercises', 'template_id', 'templates'),
      ('template_sets', 'template_exercise_id', 'template_exercises'),
      ('workouts', 'template_id', 'templates'),
      ('workout_exercises', 'workout_id', 'workouts'),
      ('workout_sets', 'workout_exercise_id', 'workout_exercises'),
      ('body_check_photos', 'body_check_id', 'body_checks'),
      ('profiles', 'active_collection_id', 'collections')
    ) as t (child, ref, parent)
  loop
    execute format(
      'create policy "parent is own on insert" on public.%1$I
         as restrictive for insert to authenticated
         with check (%2$I is null or exists (
           select 1 from public.%3$I p where p.id = %1$I.%2$I and p.user_id = (select auth.uid())
         ))', r.child, r.ref, r.parent);
    execute format(
      'create policy "parent is own on update" on public.%1$I
         as restrictive for update to authenticated
         using (true)
         with check (%2$I is null or exists (
           select 1 from public.%3$I p where p.id = %1$I.%2$I and p.user_id = (select auth.uid())
         ))', r.child, r.ref, r.parent);
  end loop;
end $$;

-- Deleting a profile would cascade to its legal acceptances; accounts are removed server-side.
create policy "profiles are permanent" on public.profiles
  as restrictive for delete to authenticated using (false);
