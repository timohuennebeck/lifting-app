-- Exercises users add themselves, private to them and created offline like plans (PowerSync).
-- Templates and workouts reference them by id in the same exercise_id column as the catalog's.

-- Whether two muscle lists share a muscle.
create function private.muscle_lists_overlap(a jsonb, b jsonb) returns boolean
language sql immutable set search_path = '' as $$
  select exists (select 1 from jsonb_array_elements_text(a) as m (value) where b ? m.value)
$$;

create table public.custom_exercises (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  -- In the user's own language; one name, not one per language like the catalog.
  name text not null check (char_length(btrim(name)) between 1 and 60),
  -- ["front_delts"]: as tapped in the form. The app turns them into shares (a primary counts
  -- twice as much as a secondary).
  primary_muscles jsonb not null check (
    private.is_muscle_list(primary_muscles) and jsonb_array_length(primary_muscles) > 0
  ),
  secondary_muscles jsonb not null default '[]' check (private.is_muscle_list(secondary_muscles)),
  -- What a set records, in display order. Locked in the app once a set is logged.
  measures jsonb not null check (
    measures in ('["reps"]', '["seconds"]', '["weight", "reps"]', '["weight", "seconds"]')
  ),
  -- Default rest between sets; plans and workouts can override it per exercise.
  rest_seconds int not null default 90 check (rest_seconds between 0 and 600),
  -- Deleted by the user: hidden from the picker, kept so history and plans keep the exercise.
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  check (not private.muscle_lists_overlap(primary_muscles, secondary_muscles))
);

create index on public.custom_exercises (user_id);

alter table public.custom_exercises enable row level security;

create policy "own rows" on public.custom_exercises for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

alter publication powersync add table public.custom_exercises;
