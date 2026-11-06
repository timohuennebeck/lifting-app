-- The workout import (README, "Workout import"): a history brought from another app or a
-- spreadsheet. The app reads the file and sends the workouts here in a few calls, instead of
-- PowerSync uploading every row on its own (a few years are about 20,000 rows); PowerSync then
-- syncs them down. The read-history Edge Function, which asks the model what the file holds, is
-- limited like the other model functions (start_plan_request, kind "history").

alter table public.plan_requests drop constraint plan_requests_kind_check;
alter table public.plan_requests
  add constraint plan_requests_kind_check
  check (kind in ('import', 'generate', 'voice', 'transcribe', 'history'));

-- Adds finished workouts to the signed-in user's history: `p_workouts` is a list of
-- {id, name, started_at, finished_at, exercises: [{id, exercise_id, position,
-- sets: [{id, position, weight_kg, reps, seconds, rir}]}]} (at most 200 workouts per call).
-- A workout that starts at the same time as one the user has (an import of the same file again)
-- is left out, with its exercises and sets. Sets count as done at the workout's start; a set that
-- beats every earlier set of its exercise (by the estimated 1RM, never the first one) is a record,
-- as the app marks them. Runs as the user, so the tables' policies and checks apply. Returns the
-- number of workouts added.
create function public.import_workouts(p_workouts jsonb)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  added uuid[];
  added_sets uuid[];
begin
  if uid is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  if jsonb_typeof(p_workouts) <> 'array' or jsonb_array_length(p_workouts) > 200 then
    raise exception 'expected at most 200 workouts' using errcode = '22023';
  end if;

  with fresh as (
    insert into public.workout_entries (id, user_id, name, started_at, finished_at, created_at)
    select
      (w ->> 'id')::uuid,
      uid,
      w ->> 'name',
      (w ->> 'started_at')::timestamptz,
      (w ->> 'finished_at')::timestamptz,
      now()
    from jsonb_array_elements(p_workouts) w
    where not exists (
      select 1 from public.workout_entries e
      where e.user_id = uid and e.started_at = (w ->> 'started_at')::timestamptz
    )
    on conflict (id) do nothing
    returning id
  )
  select coalesce(array_agg(id), '{}') into added from fresh;

  -- Separate statements: each one's policies see the parents the one before added.
  insert into public.workout_entries_exercises (id, user_id, workout_entries_id, exercise_id, position)
  select (e ->> 'id')::uuid, uid, (w ->> 'id')::uuid, e ->> 'exercise_id', (e ->> 'position')::int
  from jsonb_array_elements(p_workouts) w
  cross join jsonb_array_elements(w -> 'exercises') e
  where (w ->> 'id')::uuid = any (added);

  with fresh as (
    insert into public.workout_entries_sets (
      id, user_id, workout_entries_exercise_id, position, weight_kg, reps, seconds, rir,
      completed_at, is_pr
    )
    select
      (s ->> 'id')::uuid,
      uid,
      (e ->> 'id')::uuid,
      (s ->> 'position')::int,
      (s ->> 'weight_kg')::numeric,
      (s ->> 'reps')::int,
      (s ->> 'seconds')::int,
      (s ->> 'rir')::int,
      (w ->> 'started_at')::timestamptz,
      false
    from jsonb_array_elements(p_workouts) w
    cross join jsonb_array_elements(w -> 'exercises') e
    cross join jsonb_array_elements(e -> 'sets') s
    where (w ->> 'id')::uuid = any (added)
    returning id
  )
  select coalesce(array_agg(id), '{}') into added_sets from fresh;

  -- Records among the added sets, against all of the user's sets of their exercises.
  with touched as (
    select distinct x.exercise_id
    from public.workout_entries_exercises x
    where x.workout_entries_id = any (added)
  ),
  scored as (
    select
      s.id,
      case
        when s.seconds is not null then coalesce(s.weight_kg, 1) * s.seconds
        when s.reps is null then 0
        when s.weight_kg is null then s.reps
        else s.weight_kg * (1 + s.reps / 30.0)
      end as score,
      x.exercise_id,
      w.started_at,
      x.position as exercise_position,
      s.position as set_position
    from public.workout_entries_sets s
    join public.workout_entries_exercises x on x.id = s.workout_entries_exercise_id
    join public.workout_entries w on w.id = x.workout_entries_id
    where w.user_id = uid
      and s.completed_at is not null
      and x.exercise_id in (select exercise_id from touched)
  ),
  ranked as (
    select
      id,
      score,
      max(score) over (
        partition by exercise_id
        order by started_at, exercise_position, set_position
        rows between unbounded preceding and 1 preceding
      ) as best
    from scored
  )
  update public.workout_entries_sets s
  set is_pr = true
  from ranked r
  where r.id = s.id and s.id = any (added_sets) and r.best is not null and r.score > r.best + 0.01;

  return coalesce(array_length(added, 1), 0);
end;
$$;

revoke execute on function public.import_workouts(jsonb) from public, anon;
grant execute on function public.import_workouts(jsonb) to authenticated;
