-- The plates the user's gym has, turned off and on in the plates sheet: a JSON list of plate
-- weights per unit (a 45 lb plate is not a 20 kg one converted). Null while every plate is on,
-- so plates added later are on too. The lists mirror PLATE_WEIGHTS in
-- src/features/workout/lib/plates.ts; at least one plate stays on.
alter table public.profiles
  add column plates_kg jsonb,
  add column plates_lb jsonb,
  add constraint profiles_plates_kg_check check (
    plates_kg is null
    or (
      jsonb_typeof(plates_kg) = 'array'
      and jsonb_array_length(plates_kg) between 1 and 7
      and plates_kg <@ '[25, 20, 15, 10, 5, 2.5, 1.25]'::jsonb
    )
  ),
  add constraint profiles_plates_lb_check check (
    plates_lb is null
    or (
      jsonb_typeof(plates_lb) = 'array'
      and jsonb_array_length(plates_lb) between 1 and 6
      and plates_lb <@ '[45, 35, 25, 10, 5, 2.5]'::jsonb
    )
  );
