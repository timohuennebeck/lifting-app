-- The muscle levels are gone from the app, and with them the only use of the strength standards.
alter table public.exercises drop column strength_standard;
