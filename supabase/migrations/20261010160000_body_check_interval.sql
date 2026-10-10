-- How often the user wants a body check, in days (weekly up to every four weeks).
alter table public.profiles
  add column body_check_interval_days int not null default 14
  check (body_check_interval_days in (7, 14, 21, 28));
