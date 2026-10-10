-- An analysis takes its row before OpenAI is called, so parallel requests can't pass the daily
-- limit together; calls that may have been billed keep it as 'failed'.
alter table public.body_check_analyses drop constraint body_check_analyses_status_check;
alter table public.body_check_analyses
  add constraint body_check_analyses_status_check
  check (status in ('pending', 'ok', 'retake', 'refused', 'failed'));

-- Takes one of the user's analyses for the last 24 hours ('pending'), or returns null when they
-- are used up. Only the analyze-body-check Edge Function (service role) calls it.
create function public.start_body_check_analysis(
  p_user_id uuid,
  p_check_id uuid,
  p_daily_limit int
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  slot uuid;
begin
  -- One request per user decides at a time, so two can't both take the last slot.
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));
  if (
    select count(*) from public.body_check_analyses
    where user_id = p_user_id and created_at > now() - interval '24 hours'
  ) >= p_daily_limit then
    return null;
  end if;
  insert into public.body_check_analyses (user_id, check_id, status)
  values (p_user_id, p_check_id, 'pending')
  returning id into slot;
  return slot;
end;
$$;

revoke execute on function public.start_body_check_analysis(uuid, uuid, int)
  from public, anon, authenticated;
