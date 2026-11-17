-- The rest after each round of a superset: set when the superset is made (the longest rest of
-- its exercises) and changed only by the user, so reordering, adding an exercise or splitting it
-- never changes it. The same on all exercises of the superset; null on one standing alone, and on
-- a superset from before, which rests like its last exercise.
alter table public.routine_exercises
  add column superset_rest_seconds int,
  add constraint routine_exercises_superset_rest_seconds_range
    check (superset_rest_seconds between 0 and 600);

alter table public.workout_entries_exercises
  add column superset_rest_seconds int,
  add constraint workout_entries_exercises_superset_rest_seconds_range
    check (superset_rest_seconds between 0 and 600);
