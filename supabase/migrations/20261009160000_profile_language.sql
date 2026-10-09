-- The user's app language, so the team replies in it (support) and future server-side
-- messages can be localized. Kept in sync by the app; null until the profile first syncs.
alter table public.profiles
  add column language text check (language in ('en', 'de', 'pt-PT', 'pt-BR'));
