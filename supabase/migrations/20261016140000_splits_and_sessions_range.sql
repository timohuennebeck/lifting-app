-- Plans have 2 to 6 workouts a week (fewer can't train every muscle twice, more leave no rest
-- day); plans outside that move to the nearest end. Two more splits for the "create plan" flow:
-- upper/lower/full body (3 a week) and push/pull/legs plus an arms and shoulders day (4 a week).
update public.plans
  set sessions_per_week = least(greatest(sessions_per_week, 2), 6)
  where sessions_per_week not between 2 and 6;

alter table public.plans
  drop constraint plans_sessions_per_week_range,
  add constraint plans_sessions_per_week_range check (sessions_per_week between 2 and 6);

alter table public.profiles
  drop constraint profiles_split_check,
  add constraint profiles_split_check check (split in (
    'full_body', 'upper_lower', 'upper_lower_full', 'ppl', 'ppl_arms', 'ppl_upper_lower', 'bro',
    'arnold'
  ));
