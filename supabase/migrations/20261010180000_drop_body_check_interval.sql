-- Body checks have no rhythm for now: the user starts one whenever they want.
alter table public.profiles drop column if exists body_check_interval_days;
