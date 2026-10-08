-- Forge core schema. Every row carries user_id so PowerSync can stream per user.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  first_name text,
  sex text check (sex in ('male', 'female', 'unspecified')),
  age int check (age between 13 and 100),
  unit_system text not null default 'metric' check (unit_system in ('metric', 'imperial')),
  weight_kg numeric(5, 1),
  height_cm int,
  experience text check (experience in ('none', 'beginner', 'intermediate', 'advanced')),
  complaints jsonb not null default '[]'::jsonb,
  goal text check (goal in ('hypertrophy', 'strength', 'strength_hypertrophy')),
  focus jsonb not null default '[]'::jsonb,
  equipment text check (equipment in ('gym', 'home', 'bodyweight')),
  training_days jsonb not null default '[]'::jsonb,
  session_minutes int,
  active_collection_id uuid,
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- RLS only checks user_id; tie the row id to it so nobody can claim another user's id.
  check (id = user_id)
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table public.templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  collection_id uuid references public.collections (id) on delete set null,
  name text not null,
  weekday int check (weekday between 0 and 6),
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.template_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  template_id uuid not null references public.templates (id) on delete cascade,
  exercise_id text not null,
  position int not null default 0,
  rest_seconds int
);

create table public.template_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  template_exercise_id uuid not null references public.template_exercises (id) on delete cascade,
  position int not null default 0,
  reps_min int not null,
  reps_max int not null,
  rir int
);

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  template_id uuid references public.templates (id) on delete set null,
  name text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  workout_id uuid not null references public.workouts (id) on delete cascade,
  exercise_id text not null,
  position int not null default 0,
  rest_seconds int
);

create table public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  workout_exercise_id uuid not null references public.workout_exercises (id) on delete cascade,
  position int not null default 0,
  target_min int,
  target_max int,
  target_rir int,
  weight_kg numeric(6, 2),
  reps int,
  completed_at timestamptz,
  is_pr boolean not null default false
);

create table public.body_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  score int not null check (score between 0 and 100),
  group_scores jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index on public.templates (user_id);
create index on public.template_exercises (template_id);
create index on public.template_sets (template_exercise_id);
create index on public.workouts (user_id, started_at desc);
create index on public.workout_exercises (workout_id);
create index on public.workout_sets (workout_exercise_id);
create index on public.body_checks (user_id, created_at desc);

-- Row level security: users only ever see and change their own rows.
do $$
declare t text;
begin
  foreach t in array array[
    'profiles', 'collections', 'templates', 'template_exercises', 'template_sets',
    'workouts', 'workout_exercises', 'workout_sets', 'body_checks'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "own rows" on public.%I for all to authenticated
         using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
  end loop;
end $$;

-- Logical replication publication consumed by the PowerSync service.
create publication powersync for table
  public.profiles, public.collections, public.templates, public.template_exercises,
  public.template_sets, public.workouts, public.workout_exercises, public.workout_sets,
  public.body_checks;
