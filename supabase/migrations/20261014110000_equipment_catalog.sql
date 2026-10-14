-- Equipment becomes catalog data, like the exercises: names per language, which a full gym has
-- and which a home checklist offers. Each exercise says what it needs, so the plan generation
-- (and later filters) only offer what the user can do. New equipment is a row, no app release.

-- The table below takes the enum's name: the column becomes text first.
alter table public.exercises alter column equipment type text using equipment::text;
drop type public.equipment;

create table public.equipment (
  -- Slug, e.g. 'pull-up-bar'. Exercises and profiles refer to it, so it never changes.
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  -- {"en": "Pull-up bar", "de": "Klimmzugstange", …}; English is the fallback.
  name jsonb not null check (jsonb_typeof(name) = 'object' and name ? 'en'),
  -- "Komplettes Studio" includes it.
  in_gym boolean not null default true,
  -- Offered in the "Eigene Geräte" checklist.
  at_home boolean not null default false,
  -- Order in the checklist.
  position int not null default 0,
  -- Never deleted, only deactivated: exercises and profiles refer to it.
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create trigger equipment_updated_at before update on public.equipment
  for each row execute function private.set_updated_at();

alter table public.equipment enable row level security;

create policy "anyone reads equipment" on public.equipment for select to anon, authenticated
  using (true);

-- "bodyweight" only labels exercises without equipment (push-ups, pull-ups); no one "has" it.
insert into public.equipment (id, name, in_gym, at_home, position) values
  ('dumbbell', '{"en":"Dumbbells","de":"Kurzhanteln","pt-PT":"Halteres","pt-BR":"Halteres"}', true, true, 1),
  ('barbell', '{"en":"Barbell","de":"Langhantel","pt-PT":"Barra","pt-BR":"Barra"}', true, true, 2),
  ('rack', '{"en":"Squat rack","de":"Rack / Hantelablage","pt-PT":"Rack de agachamento","pt-BR":"Rack de agachamento"}', true, true, 3),
  ('bench', '{"en":"Bench","de":"Hantelbank","pt-PT":"Banco","pt-BR":"Banco"}', true, true, 4),
  ('pull-up-bar', '{"en":"Pull-up bar","de":"Klimmzugstange","pt-PT":"Barra de elevações","pt-BR":"Barra fixa"}', true, true, 5),
  ('dip-bars', '{"en":"Dip bars","de":"Dip-Barren","pt-PT":"Barras paralelas","pt-BR":"Barras paralelas"}', true, true, 6),
  ('kettlebell', '{"en":"Kettlebell","de":"Kettlebell","pt-PT":"Kettlebell","pt-BR":"Kettlebell"}', true, true, 7),
  ('machine', '{"en":"Machine","de":"Maschine","pt-PT":"Máquina","pt-BR":"Máquina"}', true, false, 8),
  ('cable', '{"en":"Cable","de":"Kabelzug","pt-PT":"Cabo","pt-BR":"Polia"}', true, false, 9),
  ('box', '{"en":"Box or step","de":"Box / Stepper","pt-PT":"Caixa ou step","pt-BR":"Caixa ou step"}', true, false, 10),
  ('decline-bench', '{"en":"Decline bench","de":"Negativbank","pt-PT":"Banco declinado","pt-BR":"Banco declinado"}', true, false, 11),
  ('ez-bar', '{"en":"EZ bar","de":"SZ-Stange","pt-PT":"Barra EZ","pt-BR":"Barra W"}', true, false, 12),
  ('trap-bar', '{"en":"Trap bar","de":"Trap-Bar","pt-PT":"Barra hexagonal","pt-BR":"Barra hexagonal"}', true, false, 13),
  ('landmine', '{"en":"Landmine","de":"Landmine","pt-PT":"Landmine","pt-BR":"Landmine"}', true, false, 14),
  ('preacher-bench', '{"en":"Preacher bench","de":"Scottbank","pt-PT":"Banco Scott","pt-BR":"Banco Scott"}', true, false, 15),
  ('platform', '{"en":"Lifting platform","de":"Gewichtheberplattform","pt-PT":"Plataforma de levantamento","pt-BR":"Plataforma de levantamento"}', true, false, 16),
  ('ab-wheel', '{"en":"Ab wheel","de":"Bauchroller","pt-PT":"Roda abdominal","pt-BR":"Roda abdominal"}', true, false, 17),
  ('jump-rope', '{"en":"Jump rope","de":"Springseil","pt-PT":"Corda de saltar","pt-BR":"Corda de pular"}', true, false, 18),
  ('safety-bar', '{"en":"Safety squat bar","de":"Safety Squat Bar","pt-PT":"Barra de agachamento de segurança","pt-BR":"Barra de agachamento de segurança"}', false, false, 19),
  ('bodyweight', '{"en":"Bodyweight","de":"Körpergewicht","pt-PT":"Peso corporal","pt-BR":"Peso corporal"}', false, false, 20);

-- What the app shows with the exercise ("Langhantel · Brust"), as before.
alter table public.exercises
  add constraint exercises_equipment_fkey foreign key (equipment) references public.equipment (id);
create index on public.exercises (equipment);

-- [["barbell"], ["rack"], ["bench", "box"]]: every inner list is a non-empty list of equipment
-- ids, and one of them is enough. [] = nothing needed.
create function private.is_equipment_needs(needs jsonb) returns boolean
language sql immutable set search_path = '' as $$
  select jsonb_typeof(needs) = 'array' and not exists (
    select 1 from jsonb_array_elements(needs) as g (value)
    where jsonb_typeof(g.value) <> 'array'
      or jsonb_array_length(g.value) = 0
      or exists (
        select 1 from jsonb_array_elements(g.value) as i (value)
        where jsonb_typeof(i.value) <> 'string'
          or i.value #>> '{}' !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
      )
  )
$$;

-- What the user needs for the exercise: each list met by one of its items (the rule in
-- generate-plan and the app). Whatever isn't listed (a mat, a chair) everyone has.
alter table public.exercises
  add column needs jsonb not null default '[]' check (private.is_equipment_needs(needs));

-- The ids must be equipment someone can have: a check can't look into another table.
create function private.check_exercise_needs() returns trigger
language plpgsql set search_path = '' as $$
declare
  unknown text;
begin
  -- A wrong shape is the check constraint's to report.
  if not private.is_equipment_needs(new.needs) then
    return new;
  end if;
  select i.id into unknown
  from jsonb_array_elements(new.needs) as g (value),
    jsonb_array_elements_text(g.value) as i (id)
  where i.id = 'bodyweight' or not exists (select 1 from public.equipment e where e.id = i.id)
  limit 1;
  if unknown is not null then
    raise exception 'Exercise %: "%" is not equipment it can need', new.id, unknown;
  end if;
  return new;
end;
$$;

create trigger exercises_check_needs before insert or update of needs on public.exercises
  for each row execute function private.check_exercise_needs();

update public.exercises e set needs = v.needs::jsonb
from (values
  ('ab-crunch-machine', '[["machine"]]'),
  ('ab-wheel-rollout', '[["ab-wheel"]]'),
  ('air-bike', '[["machine"]]'),
  ('arnold-press', '[["dumbbell"]]'),
  ('assisted-pull-up-machine', '[["machine"]]'),
  ('back-extension', '[["machine"]]'),
  ('back-extension-machine', '[["machine"]]'),
  ('barbell-curl', '[["barbell","ez-bar"]]'),
  ('barbell-row', '[["barbell"]]'),
  ('barbell-shrug', '[["barbell"]]'),
  ('bayesian-curl', '[["cable"]]'),
  ('behind-the-neck-press', '[["barbell"],["rack"]]'),
  ('belt-squat', '[["machine"]]'),
  ('bench-dip', '[["bench"]]'),
  ('bench-press', '[["barbell"],["rack"],["bench"]]'),
  ('bent-over-dumbbell-row', '[["dumbbell","kettlebell"]]'),
  ('box-jump', '[["box"]]'),
  ('box-squat', '[["barbell"],["rack"],["box","bench"]]'),
  ('bulgarian-split-squat', '[["dumbbell","kettlebell"],["bench"]]'),
  ('cable-chest-press', '[["cable"]]'),
  ('cable-crossover', '[["cable"]]'),
  ('cable-crunch', '[["cable"]]'),
  ('cable-curl', '[["cable"]]'),
  ('cable-external-rotation', '[["cable"]]'),
  ('cable-front-raise', '[["cable"]]'),
  ('cable-glute-kickback', '[["cable"]]'),
  ('cable-kickback', '[["cable"]]'),
  ('cable-lateral-raise', '[["cable"]]'),
  ('cable-pull-through', '[["cable"]]'),
  ('cable-rear-delt-fly', '[["cable"]]'),
  ('cable-upright-row', '[["cable"]]'),
  ('cable-woodchop', '[["cable"]]'),
  ('captains-chair-leg-raise', '[["dip-bars","machine"]]'),
  ('chest-press-machine', '[["machine"]]'),
  ('chest-supported-dumbbell-row', '[["dumbbell"],["bench"]]'),
  ('chest-supported-t-bar-row', '[["machine"]]'),
  ('chin-up', '[["pull-up-bar"]]'),
  ('clean', '[["barbell"],["platform"]]'),
  ('clean-and-jerk', '[["barbell"],["platform"]]'),
  ('close-grip-bench-press', '[["barbell"],["rack"],["bench"]]'),
  ('close-grip-lat-pulldown', '[["cable"]]'),
  ('concentration-curl', '[["dumbbell"]]'),
  ('copenhagen-plank', '[["bench"]]'),
  ('curtsy-lunge', '[["dumbbell","kettlebell"]]'),
  ('dead-hang', '[["pull-up-bar"]]'),
  ('deadlift', '[["barbell"]]'),
  ('decline-bench-press', '[["barbell"],["rack"],["decline-bench"]]'),
  ('decline-chest-press-machine', '[["machine"]]'),
  ('decline-dumbbell-press', '[["dumbbell"],["decline-bench"]]'),
  ('decline-sit-up', '[["decline-bench"]]'),
  ('deficit-deadlift', '[["barbell"]]'),
  ('dip', '[["dip-bars"]]'),
  ('dip-machine', '[["machine"]]'),
  ('drag-curl', '[["barbell","ez-bar"]]'),
  ('dumbbell-bench-press', '[["dumbbell"],["bench"]]'),
  ('dumbbell-curl', '[["dumbbell"]]'),
  ('dumbbell-floor-press', '[["dumbbell","kettlebell"]]'),
  ('dumbbell-fly', '[["dumbbell"],["bench"]]'),
  ('dumbbell-kickback', '[["dumbbell"]]'),
  ('dumbbell-preacher-curl', '[["dumbbell"],["preacher-bench","bench"]]'),
  ('dumbbell-pullover', '[["dumbbell","kettlebell"],["bench"]]'),
  ('dumbbell-romanian-deadlift', '[["dumbbell","kettlebell"]]'),
  ('dumbbell-shoulder-press', '[["dumbbell"]]'),
  ('dumbbell-shrug', '[["dumbbell","kettlebell"]]'),
  ('dumbbell-side-bend', '[["dumbbell","kettlebell"]]'),
  ('dumbbell-skull-crusher', '[["dumbbell"],["bench"]]'),
  ('dumbbell-thruster', '[["dumbbell","kettlebell"]]'),
  ('elliptical', '[["machine"]]'),
  ('exercise-bike', '[["machine"]]'),
  ('ez-bar-curl', '[["ez-bar"]]'),
  ('face-pull', '[["cable"]]'),
  ('farmers-walk', '[["dumbbell","kettlebell"]]'),
  ('floor-press', '[["barbell"],["rack"]]'),
  ('french-press', '[["barbell","ez-bar"],["bench"]]'),
  ('front-raise', '[["dumbbell"]]'),
  ('front-squat', '[["barbell"],["rack"]]'),
  ('glute-ham-raise', '[["machine"]]'),
  ('glute-kickback-machine', '[["machine"]]'),
  ('goblet-squat', '[["dumbbell","kettlebell"]]'),
  ('good-morning', '[["barbell"],["rack"]]'),
  ('hack-squat', '[["machine"]]'),
  ('hammer-curl', '[["dumbbell"]]'),
  ('hang-power-clean', '[["barbell"],["platform"]]'),
  ('hanging-knee-raise', '[["pull-up-bar"]]'),
  ('hanging-leg-raise', '[["pull-up-bar"]]'),
  ('high-to-low-cable-fly', '[["cable"]]'),
  ('hip-abduction-machine', '[["machine"]]'),
  ('hip-adduction-machine', '[["machine"]]'),
  ('hip-thrust', '[["barbell"],["bench"]]'),
  ('hip-thrust-machine', '[["machine"]]'),
  ('incline-bench-press', '[["barbell"],["rack"],["bench"]]'),
  ('incline-chest-press-machine', '[["machine"]]'),
  ('incline-dumbbell-curl', '[["dumbbell"],["bench"]]'),
  ('incline-dumbbell-fly', '[["dumbbell"],["bench"]]'),
  ('incline-dumbbell-press', '[["dumbbell"],["bench"]]'),
  ('inverted-row', '[["rack","machine"]]'),
  ('jm-press', '[["barbell","ez-bar"],["bench"]]'),
  ('jump-rope', '[["jump-rope"]]'),
  ('katana-extension', '[["cable"]]'),
  ('kelso-shrug', '[["dumbbell"],["bench"]]'),
  ('kettlebell-swing', '[["kettlebell"]]'),
  ('landmine-press', '[["barbell"],["landmine"]]'),
  ('larsen-press', '[["barbell"],["rack"],["bench"]]'),
  ('lat-pulldown', '[["cable"]]'),
  ('lateral-lunge', '[["dumbbell","kettlebell"]]'),
  ('lateral-raise', '[["dumbbell"]]'),
  ('leg-extension', '[["machine"]]'),
  ('leg-press', '[["machine"]]'),
  ('leg-press-calf-raise', '[["machine"]]'),
  ('low-to-high-cable-fly', '[["cable"]]'),
  ('lying-leg-curl', '[["machine"]]'),
  ('machine-curl', '[["machine"]]'),
  ('machine-high-row', '[["machine"]]'),
  ('machine-lat-pulldown', '[["machine"]]'),
  ('machine-lateral-raise', '[["machine"]]'),
  ('machine-row', '[["machine"]]'),
  ('meadows-row', '[["barbell"],["landmine"]]'),
  ('negative-pull-up', '[["pull-up-bar"]]'),
  ('neutral-grip-pull-up', '[["pull-up-bar"]]'),
  ('nordic-curl', '[["bench","machine"]]'),
  ('one-arm-dumbbell-row', '[["dumbbell","kettlebell"]]'),
  ('overhead-cable-extension', '[["cable"]]'),
  ('overhead-dumbbell-extension', '[["dumbbell","kettlebell"]]'),
  ('overhead-press', '[["barbell"],["rack"]]'),
  ('pallof-press', '[["cable"]]'),
  ('paused-bench-press', '[["barbell"],["rack"],["bench"]]'),
  ('paused-deadlift', '[["barbell"]]'),
  ('paused-squat', '[["barbell"],["rack"]]'),
  ('pec-deck', '[["machine"]]'),
  ('pendlay-row', '[["barbell"]]'),
  ('pendulum-squat', '[["machine"]]'),
  ('pin-press', '[["barbell"],["rack"],["bench"]]'),
  ('power-clean', '[["barbell"],["platform"]]'),
  ('preacher-curl', '[["barbell","ez-bar"],["preacher-bench"]]'),
  ('pull-up', '[["pull-up-bar"]]'),
  ('push-press', '[["barbell"],["rack"]]'),
  ('rack-pull', '[["barbell"],["rack"]]'),
  ('reverse-curl', '[["barbell","ez-bar"]]'),
  ('reverse-fly', '[["dumbbell"]]'),
  ('reverse-hack-squat', '[["machine"]]'),
  ('reverse-hyperextension', '[["machine"]]'),
  ('reverse-lunge', '[["dumbbell","kettlebell"]]'),
  ('reverse-pec-deck', '[["machine"]]'),
  ('romanian-deadlift', '[["barbell"]]'),
  ('rope-hammer-curl', '[["cable"]]'),
  ('rope-pushdown', '[["cable"]]'),
  ('rowing-machine', '[["machine"]]'),
  ('safety-bar-squat', '[["safety-bar"],["rack"]]'),
  ('seal-row', '[["barbell"],["bench"]]'),
  ('seated-barbell-press', '[["barbell"],["rack"],["bench"]]'),
  ('seated-cable-row', '[["cable"]]'),
  ('seated-calf-raise', '[["machine"]]'),
  ('seated-leg-curl', '[["machine"]]'),
  ('seated-shoulder-press', '[["machine"]]'),
  ('single-arm-cable-row', '[["cable"]]'),
  ('single-arm-dumbbell-press', '[["dumbbell","kettlebell"]]'),
  ('single-arm-lat-pulldown', '[["cable"]]'),
  ('single-arm-pushdown', '[["cable"]]'),
  ('single-leg-press', '[["machine"]]'),
  ('single-leg-romanian-deadlift', '[["dumbbell","kettlebell"]]'),
  ('smith-bench-press', '[["machine"]]'),
  ('smith-calf-raise', '[["machine"]]'),
  ('smith-close-grip-bench-press', '[["machine"]]'),
  ('smith-incline-bench-press', '[["machine"]]'),
  ('smith-lunge', '[["machine"]]'),
  ('smith-shoulder-press', '[["machine"]]'),
  ('smith-squat', '[["machine"]]'),
  ('snatch', '[["barbell"],["platform"]]'),
  ('spider-curl', '[["dumbbell"],["bench"]]'),
  ('split-squat', '[["dumbbell","kettlebell"]]'),
  ('spoto-press', '[["barbell"],["rack"],["bench"]]'),
  ('squat', '[["barbell"],["rack"]]'),
  ('stair-climber', '[["machine"]]'),
  ('standing-leg-curl', '[["machine"]]'),
  ('step-up', '[["bench","box"]]'),
  ('stiff-leg-deadlift', '[["barbell"]]'),
  ('straight-arm-pulldown', '[["cable"]]'),
  ('sumo-deadlift', '[["barbell"]]'),
  ('sumo-squat', '[["dumbbell","kettlebell"]]'),
  ('t-bar-row', '[["barbell"],["landmine"]]'),
  ('toes-to-bar', '[["pull-up-bar"]]'),
  ('torso-rotation-machine', '[["machine"]]'),
  ('trap-bar-deadlift', '[["trap-bar"]]'),
  ('treadmill', '[["machine"]]'),
  ('triceps-extension-machine', '[["machine"]]'),
  ('triceps-pushdown', '[["cable"]]'),
  ('underhand-barbell-row', '[["barbell"]]'),
  ('underhand-lat-pulldown', '[["cable"]]'),
  ('upright-row', '[["barbell","ez-bar"]]'),
  ('walking-lunge', '[["dumbbell","kettlebell"]]'),
  ('wide-grip-cable-row', '[["cable"]]'),
  ('wrist-curl', '[["dumbbell"]]'),
  ('y-raise', '[["dumbbell"]]'),
  ('z-press', '[["barbell"],["rack"]]'),
  ('zottman-curl', '[["dumbbell"]]')
) as v (id, needs)
where e.id = v.id;

-- ["dumbbell", "bench"]: the user's own equipment, used with equipment = 'home'. Not checked
-- against the catalog: ids an app version doesn't know are ignored.
alter table public.profiles
  add column home_equipment jsonb not null default '[]'::jsonb check (
    jsonb_typeof(home_equipment) = 'array'
    and jsonb_array_length(home_equipment) <= 50
    and not jsonb_path_exists(home_equipment, '$[*] ? (@.type() != "string")')
  );
