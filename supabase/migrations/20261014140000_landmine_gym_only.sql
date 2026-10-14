-- The landmine leaves the "Eigene Geräte" checklist too: three exercises, too specific for home.
-- Gyms still have it.
update public.equipment set at_home = false where id = 'landmine';
