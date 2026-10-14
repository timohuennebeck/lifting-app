-- More of what home gyms have in the "Eigene Geräte" checklist: a cable or lat pulldown
-- attachment, an EZ bar, a landmine, a box, and two new items split off from "machine" (a Smith
-- machine and a bench's leg extension / leg curl attachment). Gyms have them all, so gym plans
-- don't change. Big machines (leg press, belt squat, …) stay gym only.

insert into public.equipment (id, name, in_gym, at_home, position) values
  ('smith-machine', '{"en":"Smith machine","de":"Multipresse","pt-PT":"Máquina Smith","pt-BR":"Smith"}', true, true, 10),
  ('leg-curl-extension', '{"en":"Leg extension / curl","de":"Beinstrecker / Beinbeuger","pt-PT":"Extensão / flexão de pernas","pt-BR":"Cadeira extensora / flexora"}', true, true, 11);

update public.equipment set at_home = true where id in ('ez-bar', 'cable', 'landmine', 'box');

-- The checklist's order: the most common first.
update public.equipment e set position = v.position
from (values
  ('dumbbell', 1), ('barbell', 2), ('rack', 3), ('bench', 4), ('pull-up-bar', 5), ('dip-bars', 6),
  ('kettlebell', 7), ('ez-bar', 8), ('cable', 9), ('smith-machine', 10), ('leg-curl-extension', 11),
  ('landmine', 12), ('box', 13),
  ('machine', 20), ('decline-bench', 21), ('trap-bar', 22), ('preacher-bench', 23),
  ('platform', 24), ('ab-wheel', 25), ('jump-rope', 26), ('safety-bar', 27), ('bodyweight', 28)
) as v (id, position)
where e.id = v.id;

update public.exercises e set needs = v.needs::jsonb
from (values
  ('smith-bench-press', '[["smith-machine"],["bench"]]'),
  ('smith-close-grip-bench-press', '[["smith-machine"],["bench"]]'),
  ('smith-incline-bench-press', '[["smith-machine"],["bench"]]'),
  ('smith-shoulder-press', '[["smith-machine"],["bench"]]'),
  ('smith-squat', '[["smith-machine"]]'),
  ('smith-lunge', '[["smith-machine"]]'),
  ('smith-calf-raise', '[["smith-machine"]]'),
  -- Under a bar in a rack or the Smith machine.
  ('inverted-row', '[["rack","smith-machine"]]'),
  ('leg-extension', '[["leg-curl-extension"]]'),
  ('lying-leg-curl', '[["leg-curl-extension"]]'),
  ('seated-leg-curl', '[["leg-curl-extension"]]'),
  ('standing-leg-curl', '[["leg-curl-extension"]]')
) as v (id, needs)
where e.id = v.id;
