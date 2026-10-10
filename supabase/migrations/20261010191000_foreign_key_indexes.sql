-- Indexes for foreign keys that had none: deleting a template or collection (on delete set null)
-- and deleting an account (on delete cascade through every user_id) scanned whole tables.
create index on public.templates (collection_id);
create index on public.workouts (template_id);
create index on public.profiles (user_id);
create index on public.collections (user_id);
create index on public.template_exercises (user_id);
create index on public.template_sets (user_id);
create index on public.workout_exercises (user_id);
create index on public.workout_sets (user_id);
create index on public.ticket_messages (user_id);
create index on public.ticket_events (user_id);
create index on public.body_check_photos (user_id);
