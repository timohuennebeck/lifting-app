-- Meals the user logs: what they ate, at which meal of their own calendar day, its calories and,
-- optionally, its protein, carbs and fat. Private to them and written offline (PowerSync). The
-- app adds up the days and their 7-day average itself.

create table public.meal_entries (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  -- The user's calendar day, as the app saw it; no time zone.
  date date not null,
  meal text not null check (meal in ('breakfast', 'lunch', 'dinner', 'snack')),
  -- In the user's own words, e.g. "Oats with berries".
  name text not null check (char_length(btrim(name)) between 1 and 60),
  kcal int not null check (kcal between 0 and 9999),
  -- Grams with one decimal, as on a nutrition label; null when not given.
  protein_g numeric(4, 1) check (protein_g between 0 and 999.9),
  carbs_g numeric(4, 1) check (carbs_g between 0 and 999.9),
  fat_g numeric(4, 1) check (fat_g between 0 and 999.9),
  created_at timestamptz not null default now()
);

create index on public.meal_entries (user_id, date);

alter table public.meal_entries enable row level security;

create policy "own rows" on public.meal_entries for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

alter publication powersync add table public.meal_entries;
