-- "Trizepsdrücken am Kabel" and "Trizepsdrücken am Seil" read like the same exercise: both run on
-- the cable. The first is done with a straight bar (its instructions say so), so its name says
-- that now, as the rope one names the rope. The id stays.
update public.exercises e set name = e.name || v.name
from (values
  ('triceps-pushdown', '{"en": "Straight-Bar Triceps Pushdown", "de": "Trizepsdrücken mit Stange", "pt-PT": "Extensão de tríceps com barra reta no cabo", "pt-BR": "Tríceps na polia com barra reta", "ko": "스트레이트 바 푸시다운", "es": "Extensión de tríceps en polea con barra", "fr": "Extension triceps à la barre droite"}'::jsonb)
) as v(id, name)
where e.id = v.id;
