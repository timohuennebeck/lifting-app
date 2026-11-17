-- Supersets: exercises of a routine or workout done back to back, without rest between them, as
-- rounds. Exercises that share a superset_id form one superset; the app keeps them next to each
-- other by position. The rest after a round is the last exercise's rest_seconds. Null: the
-- exercise stands alone. Both tables already sync whole (powersync/sync-config.yaml).
alter table public.routine_exercises add column superset_id uuid;

alter table public.workout_entries_exercises add column superset_id uuid;
