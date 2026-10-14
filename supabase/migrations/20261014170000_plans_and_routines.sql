-- Plans instead of collections, routines instead of templates, workout entries instead of
-- workouts. A plan's routines no longer have weekdays: they come in order, `sessions_per_week`
-- of them make a plan week, and a plan can run in blocks of `block_weeks` that end with a deload.
-- Each workout entry records the plan and the plan week it counted for.

alter table public.collections rename to plans;
alter table public.templates rename to routines;
alter table public.template_exercises rename to routine_exercises;
alter table public.template_sets rename to routine_sets;
alter table public.workouts rename to workout_entries;
alter table public.workout_exercises rename to workout_entries_exercises;
alter table public.workout_sets rename to workout_entries_sets;

alter table public.routines rename column collection_id to plan_id;
alter table public.routine_exercises rename column template_id to routine_id;
alter table public.routine_sets rename column template_exercise_id to routine_exercise_id;
alter table public.workout_entries rename column template_id to routine_id;
alter table public.workout_entries_exercises rename column workout_id to workout_entries_id;
alter table public.workout_entries_sets
  rename column workout_exercise_id to workout_entries_exercise_id;
alter table public.profiles rename column active_collection_id to active_plan_id;

-- Checks, keys and policies follow the renames by themselves; only the names they were given change.
alter table public.plans rename constraint collections_pkey to plans_pkey;
alter table public.plans rename constraint collections_user_id_fkey to plans_user_id_fkey;
alter table public.plans rename constraint collections_name_length to plans_name_length;
alter table public.routines rename constraint templates_pkey to routines_pkey;
alter table public.routines rename constraint templates_user_id_fkey to routines_user_id_fkey;
alter table public.routines rename constraint templates_collection_id_fkey to routines_plan_id_fkey;
alter table public.routines rename constraint templates_name_length to routines_name_length;
alter table public.routine_exercises
  rename constraint template_exercises_pkey to routine_exercises_pkey;
alter table public.routine_exercises
  rename constraint template_exercises_user_id_fkey to routine_exercises_user_id_fkey;
alter table public.routine_exercises
  rename constraint template_exercises_template_id_fkey to routine_exercises_routine_id_fkey;
alter table public.routine_exercises
  rename constraint template_exercises_rest_range to routine_exercises_rest_range;
alter table public.routine_sets rename constraint template_sets_pkey to routine_sets_pkey;
alter table public.routine_sets
  rename constraint template_sets_user_id_fkey to routine_sets_user_id_fkey;
alter table public.routine_sets
  rename constraint template_sets_template_exercise_id_fkey to routine_sets_routine_exercise_id_fkey;
alter table public.routine_sets
  rename constraint template_sets_target_min_range to routine_sets_target_min_range;
alter table public.routine_sets
  rename constraint template_sets_target_max_range to routine_sets_target_max_range;
alter table public.routine_sets
  rename constraint template_sets_target_order to routine_sets_target_order;
alter table public.routine_sets rename constraint template_sets_rir_range to routine_sets_rir_range;
alter table public.workout_entries rename constraint workouts_pkey to workout_entries_pkey;
alter table public.workout_entries
  rename constraint workouts_user_id_fkey to workout_entries_user_id_fkey;
alter table public.workout_entries
  rename constraint workouts_template_id_fkey to workout_entries_routine_id_fkey;
alter table public.workout_entries_exercises
  rename constraint workout_exercises_pkey to workout_entries_exercises_pkey;
alter table public.workout_entries_exercises
  rename constraint workout_exercises_user_id_fkey to workout_entries_exercises_user_id_fkey;
alter table public.workout_entries_exercises
  rename constraint workout_exercises_workout_id_fkey
  to workout_entries_exercises_workout_entries_id_fkey;
alter table public.workout_entries_exercises
  rename constraint workout_exercises_rest_range to workout_entries_exercises_rest_range;
alter table public.workout_entries_sets
  rename constraint workout_sets_pkey to workout_entries_sets_pkey;
alter table public.workout_entries_sets
  rename constraint workout_sets_user_id_fkey to workout_entries_sets_user_id_fkey;
alter table public.workout_entries_sets
  rename constraint workout_sets_workout_exercise_id_fkey
  to workout_entries_sets_workout_entries_exercise_id_fkey;
alter table public.workout_entries_sets
  rename constraint workout_sets_target_rir_range to workout_entries_sets_target_rir_range;
alter table public.workout_entries_sets
  rename constraint workout_sets_weight_kg_range to workout_entries_sets_weight_kg_range;
alter table public.workout_entries_sets
  rename constraint workout_sets_reps_range to workout_entries_sets_reps_range;
alter table public.workout_entries_sets
  rename constraint workout_sets_seconds_check to workout_entries_sets_seconds_check;
alter table public.profiles
  rename constraint profiles_active_collection_id_fkey to profiles_active_plan_id_fkey;

alter index public.collections_user_id_idx rename to plans_user_id_idx;
alter index public.templates_user_id_idx rename to routines_user_id_idx;
alter index public.templates_collection_id_idx rename to routines_plan_id_idx;
alter index public.template_exercises_user_id_idx rename to routine_exercises_user_id_idx;
alter index public.template_exercises_template_id_idx rename to routine_exercises_routine_id_idx;
alter index public.template_sets_user_id_idx rename to routine_sets_user_id_idx;
alter index public.template_sets_template_exercise_id_idx
  rename to routine_sets_routine_exercise_id_idx;
alter index public.workouts_user_id_started_at_idx
  rename to workout_entries_user_id_started_at_idx;
alter index public.workouts_template_id_idx rename to workout_entries_routine_id_idx;
alter index public.workout_exercises_user_id_idx rename to workout_entries_exercises_user_id_idx;
alter index public.workout_exercises_workout_id_idx
  rename to workout_entries_exercises_workout_entries_id_idx;
alter index public.workout_sets_user_id_idx rename to workout_entries_sets_user_id_idx;
alter index public.workout_sets_workout_exercise_id_idx
  rename to workout_entries_sets_workout_entries_exercise_id_idx;
alter index public.profiles_active_collection_id_idx rename to profiles_active_plan_id_idx;

-- The triggers that unlink a parent deleted on another device name it as text.
drop trigger unlink_missing_collection on public.profiles;
drop trigger unlink_missing_collection on public.routines;
drop trigger unlink_missing_template on public.workout_entries;
create trigger unlink_missing_plan before insert or update on public.profiles
  for each row when (new.active_plan_id is not null)
  execute function private.unlink_missing_parent('active_plan_id', 'plans');
create trigger unlink_missing_plan before insert or update on public.routines
  for each row when (new.plan_id is not null)
  execute function private.unlink_missing_parent('plan_id', 'plans');
create trigger unlink_missing_routine before insert or update on public.workout_entries
  for each row when (new.routine_id is not null)
  execute function private.unlink_missing_parent('routine_id', 'routines');

-- A plan's week: how many workouts make one, and the block it runs in. `block_weeks` counts the
-- deload, the block's last week (empty: no blocks, every week the same). `block_start_week` is a
-- plan week a block started in (blocks repeat from it); "Deload now" and "restart block" move it.
alter table public.plans
  add column sessions_per_week int not null default 3,
  add column block_weeks int,
  add column block_start_week int not null default 1,
  add constraint plans_sessions_per_week_range check (sessions_per_week between 1 and 7),
  add constraint plans_block_weeks_range check (block_weeks in (4, 5, 6)),
  add constraint plans_block_start_week_range check (block_start_week >= 1);

-- Each plan's goal is the number of its routines that had a weekday, else of all its routines
-- (an empty plan keeps 3).
update public.plans p set sessions_per_week = least(coalesce(
  nullif((select count(*) from public.routines r where r.plan_id = p.id and r.weekday is not null), 0),
  nullif((select count(*) from public.routines r where r.plan_id = p.id), 0),
  3), 7);

-- The order replaces the weekdays: Monday's routine first, routines without a day after them.
update public.routines r set position = o.position
from (
  select id, row_number() over (
    partition by plan_id order by weekday nulls last, position, created_at
  ) - 1 as position
  from public.routines
  where plan_id is not null
) o
where o.id = r.id;

alter table public.routines drop column weekday;

-- The plan a workout counted for and its plan week. A deleted plan leaves the week as it was.
alter table public.workout_entries
  add column plan_id uuid references public.plans (id) on delete set null,
  add column plan_week int;
create index on public.workout_entries (plan_id);

-- Workouts from a plan's routines count for that plan, in plan weeks of its goal, oldest first.
update public.workout_entries w set plan_id = o.plan_id, plan_week = o.plan_week
from (
  select w.id, r.plan_id, (row_number() over (partition by r.plan_id order by w.started_at) - 1)
    / p.sessions_per_week + 1 as plan_week
  from public.workout_entries w
  join public.routines r on r.id = w.routine_id
  join public.plans p on p.id = r.plan_id
) o
where o.id = w.id;

alter table public.workout_entries
  add constraint workout_entries_plan_week_range check (plan_week >= 1),
  add constraint workout_entries_plan_week_with_plan check (plan_id is null or plan_week is not null);

create trigger unlink_missing_plan before insert or update on public.workout_entries
  for each row when (new.plan_id is not null)
  execute function private.unlink_missing_parent('plan_id', 'plans');

create policy "plan is own on insert" on public.workout_entries
  as restrictive for insert to authenticated
  with check (plan_id is null or exists (
    select 1 from public.plans p where p.id = workout_entries.plan_id and p.user_id = (select auth.uid())
  ));
create policy "plan is own on update" on public.workout_entries
  as restrictive for update to authenticated
  using (true)
  with check (plan_id is null or exists (
    select 1 from public.plans p where p.id = workout_entries.plan_id and p.user_id = (select auth.uid())
  ));

-- The weekly goal lives on the plan; the onboarding answer only fills in the plan it makes.
alter table public.profiles drop column training_days;

-- The sync config names the new tables, so PowerSync reads them all afresh once it restarts.
