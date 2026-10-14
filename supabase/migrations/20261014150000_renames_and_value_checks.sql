-- Clearer names (profiles.unit_preference, ticket_messages.content) and checks for what the app
-- already keeps to: name lengths, ranges of numbers, storage paths in the user's own folder. The
-- tables sync from the phone, so each check allows exactly what the app writes; an upload the
-- server rejects is dropped whole.

alter table public.profiles rename column unit_system to unit_preference;
alter table public.profiles
  rename constraint profiles_unit_system_check to profiles_unit_preference_check;
alter table public.ticket_messages rename column body to content;

-- Rows from before the limits are brought into range, so the checks below hold for them too.
update public.profiles set first_name = left(first_name, 24) where char_length(first_name) > 24;
update public.profiles set height_cm = least(greatest(height_cm, 119), 231)
  where height_cm not between 119 and 231;
update public.profiles set session_minutes = least(greatest(session_minutes, 10), 120)
  where session_minutes not between 10 and 120;
update public.collections set name = left(name, 30) where char_length(name) > 30;
update public.templates set name = left(name, 40) where char_length(name) > 40;
update public.template_sets set
  target_min = least(greatest(target_min, 1), 600),
  target_max = least(greatest(target_max, 1), 600),
  rir = least(greatest(rir, 0), 5)
  where target_min not between 1 and 600 or target_max not between 1 and 600
    or rir not between 0 and 5;
update public.template_sets set target_max = target_min where target_min > target_max;
update public.workout_sets set target_rir = least(greatest(target_rir, 0), 5)
  where target_rir not between 0 and 5;
update public.workout_sets set weight_kg = 0 where weight_kg < 0;
update public.workout_sets set reps = least(greatest(reps, 0), 999) where reps not between 0 and 999;
update public.template_exercises set rest_seconds = least(greatest(rest_seconds, 0), 600)
  where rest_seconds not between 0 and 600;
update public.workout_exercises set rest_seconds = least(greatest(rest_seconds, 0), 600)
  where rest_seconds not between 0 and 600;
update public.tickets set subject = left(subject, 120) where char_length(subject) > 120;
update public.ticket_messages set content = left(content, 5000) where char_length(content) > 5000;

-- Profile: the onboarding pickers' ranges. Height in cm: 120–230, or 47–91 in (119–231 cm).
alter table public.profiles
  add constraint profiles_first_name_length check (char_length(first_name) <= 24),
  add constraint profiles_height_cm_range check (height_cm between 119 and 231),
  add constraint profiles_session_minutes_range check (session_minutes between 10 and 120);

-- Names: a plan up to 30 characters, a training up to 40 (src/shared/lib/limits.ts).
alter table public.collections
  add constraint collections_name_length check (char_length(name) <= 30);
alter table public.templates
  add constraint templates_name_length check (char_length(name) <= 40);

-- Targets: reps up to 60 or seconds up to 600 (which one depends on the exercise), the minimum
-- not above the maximum; reps in reserve 0–5; rest up to 10 minutes, as in the catalog.
alter table public.template_sets
  add constraint template_sets_target_min_range check (target_min between 1 and 600),
  add constraint template_sets_target_max_range check (target_max between 1 and 600),
  add constraint template_sets_target_order check (target_min <= target_max),
  add constraint template_sets_rir_range check (rir between 0 and 5);
alter table public.template_exercises
  add constraint template_exercises_rest_range check (rest_seconds between 0 and 600);
alter table public.workout_exercises
  add constraint workout_exercises_rest_range check (rest_seconds between 0 and 600);

-- Logged sets: the number pad's limits (9,999.99 kg fit the column; reps three digits).
alter table public.workout_sets
  add constraint workout_sets_target_rir_range check (target_rir between 0 and 5),
  add constraint workout_sets_weight_kg_range check (weight_kg >= 0),
  add constraint workout_sets_reps_range check (reps between 0 and 999);

-- Files: a check's photo at <user>/<check>/<pose>.jpg in the body-checks bucket, a message's
-- screenshots (at most 5) under <user>/<ticket>/ in ticket-attachments, as the app saves them.
alter table public.body_check_photos
  add constraint body_check_photos_path check (
    storage_path = user_id::text || '/' || body_check_id::text || '/' || pose || '.jpg'
  );

create function private.are_ticket_files(paths jsonb, folder text) returns boolean
language sql immutable set search_path = '' as $$
  select jsonb_typeof(paths) = 'array' and jsonb_array_length(paths) <= 5 and not exists (
    select 1 from jsonb_array_elements(paths) as p (value)
    where jsonb_typeof(p.value) <> 'string' or not starts_with(p.value #>> '{}', folder)
  )
$$;

alter table public.ticket_messages
  add constraint ticket_messages_attachments_check check (
    private.are_ticket_files(attachments, user_id::text || '/' || ticket_id::text || '/')
  ),
  add constraint ticket_messages_content_length check (char_length(content) <= 5000);
alter table public.tickets
  add constraint tickets_subject_length check (char_length(subject) <= 120);

-- Home equipment: ids of the catalog's equipment, as `needs` (a check can't look into another
-- table). "bodyweight" only labels exercises; no one has it.
create function private.check_home_equipment() returns trigger
language plpgsql set search_path = '' as $$
declare
  unknown text;
begin
  select i.id into unknown
  from jsonb_array_elements_text(new.home_equipment) as i (id)
  where i.id = 'bodyweight' or not exists (select 1 from public.equipment e where e.id = i.id)
  limit 1;
  if unknown is not null then
    raise exception 'Profile %: "%" is not equipment one can have', new.id, unknown;
  end if;
  return new;
end;
$$;

create trigger profiles_check_home_equipment before insert or update of home_equipment
  on public.profiles for each row execute function private.check_home_equipment();

-- Every document says its language; the old default was a leftover.
alter table public.legal_documents alter column locale drop default;

-- PowerSync keeps synced rows as it last saw them, with the old column names: touching the rows
-- sends them again under the new ones.
update public.profiles set unit_preference = unit_preference;
update public.ticket_messages set content = content;
