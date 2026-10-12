-- Plan imports run during onboarding, before there is an account, so the analyze-plan function
-- limits them per network (a keyed hash of the IP, never the IP itself) and in total per day:
-- each one is a paid model call. Only the function (service role) reads and writes this.

create table public.plan_import_requests (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index on public.plan_import_requests (ip_hash, created_at);
create index on public.plan_import_requests (created_at);

alter table public.plan_import_requests enable row level security;

-- Takes one import for the network if it and everyone together are below their limits in the
-- last 24 hours: its row id (deleted again when OpenAI fails), or null. One lock for all, so
-- parallel requests can't both take the last one. Rows older than two days go along the way.
create function public.start_plan_import(p_ip_hash text, p_ip_limit int, p_daily_limit int)
returns bigint
language plpgsql
set search_path = ''
as $$
declare
  slot bigint;
begin
  perform pg_advisory_xact_lock(hashtextextended('plan_import', 0));
  delete from public.plan_import_requests where created_at < now() - interval '2 days';
  if (
    select count(*) from public.plan_import_requests
    where ip_hash = p_ip_hash and created_at > now() - interval '24 hours'
  ) >= p_ip_limit then
    return null;
  end if;
  if (
    select count(*) from public.plan_import_requests
    where created_at > now() - interval '24 hours'
  ) >= p_daily_limit then
    return null;
  end if;
  insert into public.plan_import_requests (ip_hash) values (p_ip_hash) returning id into slot;
  return slot;
end;
$$;

revoke execute on function public.start_plan_import(text, int, int) from public, anon, authenticated;
