-- A template set's target boxes can be left empty (the app writes null when one is cleared), but
-- the columns kept the not-null of the reps_min/reps_max they were renamed from, so such a change
-- was rejected and dropped by the upload queue.
alter table public.template_sets
  alter column target_min drop not null,
  alter column target_max drop not null;
