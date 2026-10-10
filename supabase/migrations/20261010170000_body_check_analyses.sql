-- Every AI analysis of a body check, written only by the analyze-body-check Edge Function.
-- Limits how often a user can run one, and is where a saved check's values come from.
create table public.body_check_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- The check the photos belong to; it only exists in body_checks once the user saved it.
  check_id uuid not null,
  status text not null check (status in ('ok', 'retake', 'refused')),
  -- 'ok': { score, groupScores, metrics }; 'retake': { issues }.
  result jsonb,
  created_at timestamptz not null default now()
);

create index on public.body_check_analyses (user_id, created_at desc);
create index on public.body_check_analyses (check_id);

-- Server-only: no policies, so the app can neither read nor write it.
alter table public.body_check_analyses enable row level security;

-- A saved check takes its values and time from its analysis, whatever the app sent; a check
-- without one is rejected (42501, which the app's upload queue drops).
create function public.body_check_from_analysis()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  analysis public.body_check_analyses;
begin
  select * into analysis
  from public.body_check_analyses
  where check_id = new.id and user_id = new.user_id and status = 'ok'
  order by created_at desc
  limit 1;
  if analysis.id is null then
    raise exception 'Body check % has no analysis', new.id using errcode = '42501';
  end if;
  new.score := (analysis.result ->> 'score')::int;
  new.group_scores := analysis.result -> 'groupScores';
  new.metrics := analysis.result -> 'metrics';
  new.created_at := analysis.created_at;
  return new;
end;
$$;

create trigger body_check_from_analysis
  before insert on public.body_checks
  for each row execute function public.body_check_from_analysis();

-- A saved check's values never change.
create function public.keep_body_check_values()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.score := old.score;
  new.group_scores := old.group_scores;
  new.metrics := old.metrics;
  new.created_at := old.created_at;
  return new;
end;
$$;

create trigger keep_body_check_values
  before update on public.body_checks
  for each row execute function public.keep_body_check_values();
