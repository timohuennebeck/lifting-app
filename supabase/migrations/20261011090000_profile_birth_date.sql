-- The profile keeps the birth date instead of the age, so the app can say on which day the 18+
-- body check unlocks. There are no users yet, so no ages are carried over.
-- Like AGE_RANGE in the app, the date lies at least 14 years back, with one day of slack for time
-- zones ahead of UTC: the app checks against the local date, and an upload this check rejects is
-- dropped with its whole transaction (the rest of the onboarding). The earliest date is fixed
-- instead of 100 years back: a bound moving with today would make stored rows invalid over time
-- and break restoring a dump.
alter table public.profiles
  add column birth_date date check (
    birth_date >= date '1900-01-01'
    and birth_date <= (current_date - interval '14 years')::date + 1
  );

alter table public.profiles drop column age;
