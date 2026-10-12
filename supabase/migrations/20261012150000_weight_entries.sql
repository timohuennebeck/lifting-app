-- Body weight, one entry per day of the user's own calendar. Replaces profiles.weight_kg: the
-- app shows the entries and a smoothed trend it computes from them, and the onboarding answer
-- becomes the first entry.

-- The id of a user's entry on a date. The app derives the same one (weightEntryId), so two
-- devices saving the same day write one row, the last save winning, instead of colliding on
-- (user_id, date).
create function private.weight_entry_id(user_id uuid, date date) returns uuid
language sql immutable set search_path = '' as $$
  select substr(encode(sha256(convert_to(user_id::text || ':' || date::text, 'UTF8')), 'hex'), 1, 32)::uuid
$$;

create table public.weight_entries (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  -- The user's calendar day, as the app saw it; no time zone.
  date date not null,
  -- Always kg, two decimals so pounds convert back exactly.
  weight_kg numeric(5, 2) not null check (weight_kg between 20 and 400),
  created_at timestamptz not null default now(),
  unique (user_id, date),
  -- Moving an entry to another day is a new row; an update can't change its date.
  check (id = private.weight_entry_id(user_id, date))
);

alter table public.weight_entries enable row level security;

create policy "own rows" on public.weight_entries for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

alter publication powersync add table public.weight_entries;

-- The weight given in onboarding becomes the first entry, on the day onboarding finished.
insert into public.weight_entries (id, user_id, date, weight_kg, created_at)
select private.weight_entry_id(p.user_id, d.date), p.user_id, d.date, p.weight_kg, d.at
from public.profiles p
cross join lateral (
  select coalesce(p.onboarded_at, p.created_at) as at,
    coalesce(p.onboarded_at, p.created_at)::date as date
) d
where p.weight_kg between 20 and 400;

alter table public.profiles drop column weight_kg;
