-- The app's minimum age now depends on the user's country (13 to 16, minimumAge in the app), so
-- the profile accepts birth dates from 13 years back, the lowest of them, with the same day of
-- slack for time zones ahead of UTC as before.
alter table public.profiles drop constraint profiles_birth_date_check;

alter table public.profiles
  add constraint profiles_birth_date_check check (
    birth_date >= date '1900-01-01'
    and birth_date <= (current_date - interval '13 years')::date + 1
  );
