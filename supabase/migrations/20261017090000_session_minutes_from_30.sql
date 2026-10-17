-- Workouts last 30 to 120 minutes (the plan flow's dial); shorter saved lengths move up to 30.
update public.profiles set session_minutes = 30 where session_minutes < 30;

alter table public.profiles
  drop constraint profiles_session_minutes_range,
  add constraint profiles_session_minutes_range check (session_minutes between 30 and 120);
