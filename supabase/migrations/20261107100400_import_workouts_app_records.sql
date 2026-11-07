-- Imports workouts (up to 200 a call) and marks records the way the app does when a set is logged
-- (setScoreSql): Epley's one-rep max of the load, where a bodyweight exercise's load is the body
-- weight plus what was added and an assisted machine's the body weight minus the assistance, so
-- more assistance is never a record. The body weight is the user's latest weigh-in, else 78 kg.
-- A set is a record when it beats every earlier counted set of its exercise. The flags of the
-- user's sets of those exercises from the oldest workout added on are set again, so an imported
-- older, heavier set also takes the star from a later set it beats.

create or replace function public.import_workouts(p_workouts jsonb)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  added uuid[];
  since timestamptz;
  body_weight numeric;
  gained uuid[];
  lost uuid[];
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
  if coalesce(array_length(added, 1), 0) = 0 then
    return 0;
  end if;

  -- Separate statements: each one's policies see the parents the one before added.
  insert into public.workout_entries_exercises (id, user_id, workout_entries_id, exercise_id, position)
  select (e ->> 'id')::uuid, uid, (w ->> 'id')::uuid, e ->> 'exercise_id', (e ->> 'position')::int
  from jsonb_array_elements(p_workouts) w
  cross join jsonb_array_elements(w -> 'exercises') e
  where (w ->> 'id')::uuid = any (added);

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
  where (w ->> 'id')::uuid = any (added);

  select min(started_at) into since from public.workout_entries where id = any (added);
  select coalesce(
    (select weight_kg from public.weight_entries where user_id = uid order by date desc limit 1),
    78
  ) into body_weight;

  with touched as (
    select distinct x.exercise_id
    from public.workout_entries_exercises x
    where x.workout_entries_id = any (added)
  ),
  scored as (
    select
      s.id,
      s.is_pr,
      case
        when s.seconds is not null then coalesce(s.weight_kg, 1) * s.seconds
        when s.reps is null then 0
        when s.weight_kg is null then s.reps
        else (case
          when c.equipment = 'bodyweight' then body_weight + s.weight_kg
          when c.assisted then greatest(body_weight - s.weight_kg, 0)
          else s.weight_kg
        end) * (1 + s.reps / 30.0)
      end as score,
      x.exercise_id,
      w.started_at,
      x.position as exercise_position,
      s.position as set_position
    from public.workout_entries_sets s
    join public.workout_entries_exercises x on x.id = s.workout_entries_exercise_id
    join public.workout_entries w on w.id = x.workout_entries_id
    left join public.exercises c on c.id = x.exercise_id
    where w.user_id = uid
      and s.completed_at is not null
      and x.exercise_id in (select exercise_id from touched)
  ),
  ranked as (
    select
      id,
      is_pr,
      started_at,
      coalesce(max(score) over (
        partition by exercise_id
        order by started_at, exercise_position, set_position
        rows between unbounded preceding and 1 preceding
      ), 0) > 0
        and score > max(score) over (
          partition by exercise_id
          order by started_at, exercise_position, set_position
          rows between unbounded preceding and 1 preceding
        ) + 0.01 as record
    from scored
  )
  select
    coalesce(array_agg(id) filter (where record and not is_pr), '{}'),
    coalesce(array_agg(id) filter (where not record and is_pr), '{}')
  into gained, lost
  from ranked
  where started_at >= since;

  update public.workout_entries_sets set is_pr = true where id = any (gained);
  update public.workout_entries_sets set is_pr = false where id = any (lost);

  return array_length(added, 1);
end;
$$;
