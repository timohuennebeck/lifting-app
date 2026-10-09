-- The bundled exercise photos were placeholders and are gone from the app. Clear their
-- paths so no client looks for them; updated_at moves on (trigger), so apps pick it up.
update public.exercises
set image_path = null
where image_path is not null;
