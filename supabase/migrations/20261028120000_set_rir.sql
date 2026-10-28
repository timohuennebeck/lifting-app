-- Reps in reserve a logged set actually had, entered in the live workout's number pad (0 to 5,
-- 5 meaning 5 or more). Null when it wasn't entered: the suggestions then assume the target.
alter table public.workout_entries_sets
  add column rir int,
  add constraint workout_entries_sets_rir_range check (rir between 0 and 5);
