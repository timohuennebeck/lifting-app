-- The plan generation (generate-plan) is limited like the plan import, but on its own: both run
-- before there is an account and each request is a paid model call. The requests table now holds
-- both, with the kind of each, and one function takes a request of either kind.

alter table public.plan_import_requests rename to plan_requests;
alter table public.plan_requests
  add column kind text not null default 'import' check (kind in ('import', 'generate'));
alter table public.plan_requests alter column kind drop default;

drop index public.plan_import_requests_ip_hash_created_at_idx;
drop index public.plan_import_requests_created_at_idx;
create index on public.plan_requests (kind, ip_hash, created_at);
create index on public.plan_requests (kind, created_at);

drop function public.start_plan_import(text, int, int);

-- Takes one request of `p_kind` for the network if it and everyone together are below their
-- limits for that kind in the last 24 hours: its row id (deleted again when OpenAI fails), or
-- null. One lock per kind, so parallel requests can't both take the last one. Rows older than two
-- days go along the way.
create function public.start_plan_request(
  p_kind text,
  p_ip_hash text,
  p_ip_limit int,
  p_daily_limit int
)
returns bigint
language plpgsql
set search_path = ''
as $$
declare
  slot bigint;
begin
  perform pg_advisory_xact_lock(hashtextextended('plan_' || p_kind, 0));
  delete from public.plan_requests where created_at < now() - interval '2 days';
  if (
    select count(*) from public.plan_requests
    where kind = p_kind and ip_hash = p_ip_hash and created_at > now() - interval '24 hours'
  ) >= p_ip_limit then
    return null;
  end if;
  if (
    select count(*) from public.plan_requests
    where kind = p_kind and created_at > now() - interval '24 hours'
  ) >= p_daily_limit then
    return null;
  end if;
  insert into public.plan_requests (kind, ip_hash) values (p_kind, p_ip_hash) returning id into slot;
  return slot;
end;
$$;

revoke execute on function public.start_plan_request(text, text, int, int)
  from public, anon, authenticated;
