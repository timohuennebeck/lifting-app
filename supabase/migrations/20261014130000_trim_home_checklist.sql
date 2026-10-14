-- Dip bars and the EZ bar leave the "Eigene Geräte" checklist: too specific for what they add
-- (dips; EZ curls, which barbell curls cover). Gyms still have them.
update public.equipment set at_home = false where id in ('dip-bars', 'ez-bar');
