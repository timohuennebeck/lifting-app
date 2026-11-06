-- What the live workout suggested for a set when it was logged (the "Vorschlag" column), so the
-- next suggestions can tell a missed set (fewer reps than suggested) from one done as suggested.
-- Null when nothing was suggested. Weight always kg, like weight_kg; seconds for timed exercises.
alter table public.workout_entries_sets
  add column suggested_weight_kg numeric(6, 2),
  add column suggested_reps int,
  add column suggested_seconds int,
  add constraint workout_entries_sets_suggested_weight_kg_range check (suggested_weight_kg >= 0),
  add constraint workout_entries_sets_suggested_reps_range check (suggested_reps between 0 and 999),
  add constraint workout_entries_sets_suggested_seconds_check check (suggested_seconds > 0);
