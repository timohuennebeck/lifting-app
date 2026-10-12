-- Two kinds of exercise the app counts differently.

-- Cardio trains the heart more than the muscles: its sets stay out of the muscle stats (the
-- exercise page still shows the muscles it works).
alter table public.exercises add column cardio boolean not null default false;

-- The logged weight is a counterweight that helps (assisted pull-up machine): less weight is the
-- harder set, so records go the other way and the weight isn't counted as lifted volume.
alter table public.exercises add column assisted boolean not null default false;

update public.exercises set cardio = true
where id in (
  'treadmill', 'elliptical', 'exercise-bike', 'rowing-machine', 'stair-climber', 'air-bike',
  'jumping-jack', 'high-knees', 'jump-rope'
);

update public.exercises set assisted = true where id = 'assisted-pull-up-machine';
