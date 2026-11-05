-- How the user loads an exercise in the live workout: the weight of the bar (or a machine's
-- sled) the plates go on, or none. One row per user and exercise, written once the user changes
-- it in the plates sheet; without one the app starts from the exercise (a barbell 20 kg or
-- 45 lb, an EZ bar 10 kg, a trap bar 25 kg, a safety bar 30 kg, machines without).

-- The id of a user's row for an exercise. The app derives the same one (exerciseSettingId), so
-- two devices saving the same exercise write one row, the last save winning.
create function private.exercise_setting_id(user_id uuid, exercise_id text) returns uuid
language sql immutable set search_path = '' as $$
  select substr(encode(sha256(convert_to(user_id::text || ':' || exercise_id, 'UTF8')), 'hex'), 1, 32)::uuid
$$;

create table public.exercise_settings (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  -- A catalog id or a custom exercise's id, like routine_exercises.exercise_id.
  exercise_id text not null,
  -- Always kg, two decimals so pounds convert back exactly. Kept while no_bar is on, so turning
  -- the bar back on brings back its weight.
  bar_kg numeric(5, 2) not null check (bar_kg > 0 and bar_kg <= 100),
  no_bar boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, exercise_id),
  check (id = private.exercise_setting_id(user_id, exercise_id))
);

create trigger exercise_settings_updated_at before update on public.exercise_settings
  for each row execute function private.set_updated_at();

alter table public.exercise_settings enable row level security;

create policy "own rows" on public.exercise_settings for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

alter publication powersync add table public.exercise_settings;
