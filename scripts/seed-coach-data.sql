-- Fills a local dev account with months of training, weigh-ins and body checks, so the coach has
-- something to answer from. Local stack only; run it in the database container (README, "Coach"):
--   docker exec -i supabase_db_loqqa psql -U postgres -v email=you@example.com < scripts/seed-coach-data.sql
-- Running it again replaces what it added before; weigh-ins on the same days are overwritten.

\set ON_ERROR_STOP on
begin;

create temp table seed_user on commit drop as
  select id from auth.users where email = :'email';

do $$
begin
  if not exists (select 1 from seed_user) then
    raise exception 'No account with that email in the local database';
  end if;
end $$;

-- Same numbers on every run.
select setseed(0.42);

-- What an earlier run added (its ids come from the user and the day).
delete from public.workout_entries w using seed_user u
  where w.user_id = u.id and w.id::text like '5eed%';
delete from public.progress_checks c using seed_user u
  where c.user_id = u.id and c.id::text like '5eed%';
delete from public.progress_check_runs r using seed_user u
  where r.user_id = u.id and r.check_id::text like '5eed%';

-- A seeded id: "5eed" and then a hash of the user and `key`.
create function pg_temp.seed_id(user_id uuid, key text) returns uuid language sql immutable as $$
  select ('5eed' || substr(md5(user_id::text || ':' || key), 5))::uuid
$$;

-- Training days for 34 weeks up to today: Monday, Wednesday, Friday and every other Saturday,
-- with two weeks off twelve weeks ago (vacation) and a missed week two months ago; today always.
create temp table seed_days on commit drop as
  with days as (
    select (current_date - n)::date as day
    from generate_series(0, 7 * 34) as n
  )
  select day
  from days
  where day = current_date
    or ((extract(isodow from day) in (1, 3, 5)
         or (extract(isodow from day) = 6 and (extract(week from day)::int % 2) = 0))
      and day not between current_date - 84 and current_date - 70
      and day not between current_date - 60 and current_date - 56
      -- Now and then a session is skipped.
      and random() > 0.12);

-- Push, Pull and Beine in turn, counted back from today's Push.
create temp table seed_workouts on commit drop as
  select
    day,
    (array['Push', 'Beine', 'Pull'])[((row_number() over (order by day desc) - 1) % 3 + 1)::int] as name,
    -- Weeks of training so far: the weights grow with it.
    (day - (current_date - 7 * 34)) / 7.0 as week
  from seed_days;

-- Each day's exercises: start weight, weekly gain, sets, reps and how often it's done.
create temp table seed_plan (
  workout text, position int, exercise_id text, start_kg numeric, weekly numeric,
  sets int, reps int, step numeric, share numeric
) on commit drop;
insert into seed_plan values
  ('Push', 0, 'bench-press', 88, 0.55, 4, 6, 2.5, 1),
  ('Push', 1, 'overhead-press', 45, 0.3, 3, 8, 2.5, 1),
  ('Push', 2, 'incline-dumbbell-press', 24, 0.18, 3, 10, 2, 1),
  ('Push', 3, 'lateral-raise', 8, 0.08, 3, 14, 1, 1),
  ('Push', 4, 'triceps-pushdown', 25, 0.25, 3, 12, 2.5, 1),
  ('Pull', 0, 'deadlift', 138, 1, 3, 5, 2.5, 1),
  ('Pull', 1, 'barbell-row', 60, 0.45, 4, 8, 2.5, 1),
  ('Pull', 2, 'lat-pulldown', 55, 0.4, 3, 10, 2.5, 1),
  ('Pull', 3, 'reverse-pec-deck', 30, 0.1, 2, 15, 2.5, 0.35),
  ('Pull', 4, 'barbell-curl', 30, 0.2, 3, 10, 2.5, 1),
  ('Beine', 0, 'squat', 108, 0.5, 4, 6, 2.5, 1),
  ('Beine', 1, 'romanian-deadlift', 80, 0.55, 3, 8, 2.5, 1),
  ('Beine', 2, 'leg-press', 150, 1.4, 3, 10, 5, 1),
  ('Beine', 3, 'seated-leg-curl', 40, 0.4, 3, 12, 2.5, 1),
  ('Beine', 4, 'calf-raise', 60, 0.3, 3, 12, 5, 0.4);

insert into public.workout_entries (id, user_id, name, started_at, finished_at, created_at)
select
  pg_temp.seed_id(u.id, 'workout:' || w.day),
  u.id,
  w.name,
  -- Evenings; today's ended an hour ago.
  case when w.day = current_date then now() - interval '2 hours 10 minutes'
       else w.day + time '17:30' + (random() * 40) * interval '1 minute' end,
  null,
  now()
from seed_workouts w cross join seed_user u;

-- 55 to 80 minutes each.
update public.workout_entries w
  set finished_at = w.started_at + (55 + random() * 25) * interval '1 minute'
  from seed_user u
  where w.user_id = u.id and w.id::text like '5eed%';

insert into public.workout_entries_exercises (id, user_id, workout_entries_id, exercise_id, position, rest_seconds)
select
  pg_temp.seed_id(u.id, 'exercise:' || w.day || ':' || p.position),
  u.id,
  pg_temp.seed_id(u.id, 'workout:' || w.day),
  p.exercise_id,
  p.position,
  case when p.position < 2 then 150 else 90 end
from seed_workouts w
join seed_plan p on p.workout = w.name
cross join seed_user u
-- Per workout and exercise (a random() here would be drawn once per exercise).
where abs(hashtext(w.day || p.exercise_id)) % 100 < p.share * 100;

-- Every set done, reps falling off a little; the weight follows the weeks with some day-to-day
-- noise, rounded to the plates (`step`).
insert into public.workout_entries_sets
  (id, user_id, workout_entries_exercise_id, position, weight_kg, reps, rir, completed_at, is_pr)
select
  pg_temp.seed_id(u.id, 'set:' || w.day || ':' || p.position || ':' || s.n),
  u.id,
  e.id,
  s.n,
  greatest(p.step, round((p.start_kg + p.weekly * w.week + (random() - 0.5) * p.step) / p.step) * p.step),
  greatest(1, p.reps - (s.n / 2) + (random() * 2)::int - 1),
  (1 + random() * 2)::int,
  we.started_at + ((p.position * 12 + s.n * 3) * interval '1 minute'),
  false
from seed_workouts w
join seed_plan p on p.workout = w.name
cross join seed_user u
join public.workout_entries_exercises e
  on e.id = pg_temp.seed_id(u.id, 'exercise:' || w.day || ':' || p.position)
join public.workout_entries we on we.id = e.workout_entries_id
cross join lateral generate_series(0, p.sets - 1) as s(n);

-- Records as the app marks them: a set that beats every earlier set of its exercise (by the
-- estimated 1RM), never the first one.
with scored as (
  select
    s.id,
    s.weight_kg * (1 + s.reps / 30.0) as score,
    max(s.weight_kg * (1 + s.reps / 30.0)) over (
      partition by e.exercise_id
      order by w.started_at, e.position, s.position
      rows between unbounded preceding and 1 preceding
    ) as best
  from public.workout_entries_sets s
  join public.workout_entries_exercises e on e.id = s.workout_entries_exercise_id
  join public.workout_entries w on w.id = e.workout_entries_id
  join seed_user u on w.user_id = u.id
  where s.completed_at is not null
)
update public.workout_entries_sets s
  set is_pr = true
  from scored
  where scored.id = s.id and s.id::text like '5eed%'
    and scored.best is not null and scored.score > scored.best + 0.01;

-- Weigh-ins on most days of the last six months: from about 84.2 down to 79.6 kg.
insert into public.weight_entries (id, user_id, date, weight_kg, created_at)
select
  private.weight_entry_id(u.id, d.day),
  u.id,
  d.day,
  round((84.2 - 4.6 * (180 - (current_date - d.day)) / 180.0 + (random() - 0.5) * 0.9)::numeric, 1),
  d.day + time '07:15'
from (select (current_date - n)::date as day from generate_series(0, 180) as n) d
cross join seed_user u
where random() > 0.3 or d.day = current_date
on conflict (id) do update set weight_kg = excluded.weight_kg;

-- Four body checks (without photos): the score climbs from 58 to 67.
insert into public.progress_check_runs (id, user_id, check_id, status, result, created_at)
select
  pg_temp.seed_id(u.id, 'run:' || c.n),
  u.id,
  pg_temp.seed_id(u.id, 'check:' || c.n),
  'ok',
  jsonb_build_object(
    'score', c.score,
    'groupScores', jsonb_build_object(
      'shoulders', c.score + 2, 'chest', c.score + 4, 'arms', c.score,
      'back', c.score + 3, 'core', c.score - 6, 'legs', c.score - 2),
    'metrics', jsonb_build_object(
      'bodyFat', c.body_fat, 'proportions', c.score + 1, 'definition', c.score - 4)),
  now() - c.days_ago * interval '1 day'
from (values (1, 150, 58, 18.6), (2, 100, 61, 17.5), (3, 50, 64, 16.3), (4, 10, 67, 15.2))
  as c(n, days_ago, score, body_fat)
cross join seed_user u;

insert into public.progress_checks (id, user_id, score)
select pg_temp.seed_id(u.id, 'check:' || n), u.id, 0
from generate_series(1, 4) as n cross join seed_user u;

select
  (select count(*) from public.workout_entries w join seed_user u on w.user_id = u.id
     where w.id::text like '5eed%') as workouts,
  (select count(*) from public.workout_entries_sets s join seed_user u on s.user_id = u.id
     where s.id::text like '5eed%') as sets,
  (select count(*) from public.workout_entries_sets s join seed_user u on s.user_id = u.id
     where s.id::text like '5eed%' and s.is_pr) as records,
  (select count(*) from public.weight_entries e join seed_user u on e.user_id = u.id) as weigh_ins,
  (select count(*) from public.progress_checks c join seed_user u on c.user_id = u.id
     where c.id::text like '5eed%') as body_checks;

commit;
