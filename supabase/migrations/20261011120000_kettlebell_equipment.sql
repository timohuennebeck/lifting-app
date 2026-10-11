-- Kettlebell exercises (the swing) at launch. Its own migration: a new enum value can't be used
-- in the transaction that adds it.
alter type public.equipment add value if not exists 'kettlebell' after 'dumbbell';
