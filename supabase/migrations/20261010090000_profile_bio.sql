-- The "About you" text on the profile, written by the user (up to 150 characters).
alter table public.profiles add column bio text check (char_length(bio) <= 150);
