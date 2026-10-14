-- The body check is called the progress check everywhere: its tables, columns, constraints,
-- indexes, functions, triggers and photo bucket. An analysis of the photos is a run of the
-- assess-progress Edge Function.

alter table public.body_checks rename to progress_checks;
alter table public.body_check_photos rename to progress_check_photos;
alter table public.body_check_analyses rename to progress_check_runs;
alter table public.progress_check_photos rename column body_check_id to check_id;

-- Checks and policies follow the renames by themselves; only the names they were given change.
alter table public.progress_checks rename constraint body_checks_pkey to progress_checks_pkey;
alter table public.progress_checks
  rename constraint body_checks_score_check to progress_checks_score_check;
alter table public.progress_checks
  rename constraint body_checks_user_id_fkey to progress_checks_user_id_fkey;
alter table public.progress_check_photos
  rename constraint body_check_photos_pkey to progress_check_photos_pkey;
alter table public.progress_check_photos
  rename constraint body_check_photos_body_check_id_fkey to progress_check_photos_check_id_fkey;
alter table public.progress_check_photos
  rename constraint body_check_photos_user_id_fkey to progress_check_photos_user_id_fkey;
alter table public.progress_check_photos
  rename constraint body_check_photos_pose_check to progress_check_photos_pose_check;
alter table public.progress_check_photos
  rename constraint body_check_photos_path to progress_check_photos_path;
alter table public.progress_check_runs
  rename constraint body_check_analyses_pkey to progress_check_runs_pkey;
alter table public.progress_check_runs
  rename constraint body_check_analyses_status_check to progress_check_runs_status_check;
alter table public.progress_check_runs
  rename constraint body_check_analyses_user_id_fkey to progress_check_runs_user_id_fkey;

alter index public.body_checks_user_id_created_at_idx
  rename to progress_checks_user_id_created_at_idx;
alter index public.body_check_photos_body_check_id_idx rename to progress_check_photos_check_id_idx;
alter index public.body_check_photos_user_id_idx rename to progress_check_photos_user_id_idx;
alter index public.body_check_analyses_check_id_idx rename to progress_check_runs_check_id_idx;
alter index public.body_check_analyses_user_id_created_at_idx
  rename to progress_check_runs_user_id_created_at_idx;

-- Function bodies name the tables as text, so the ones that read a table get a new body; renaming
-- first keeps their grants and triggers.
alter function public.body_check_from_analysis() rename to progress_check_from_run;
alter trigger body_check_from_analysis on public.progress_checks rename to progress_check_from_run;

-- A saved check takes its values and time from its run, whatever the app sent; a check without
-- one is rejected (42501, which the app's upload queue drops).
create or replace function public.progress_check_from_run()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  run public.progress_check_runs;
begin
  select * into run
  from public.progress_check_runs
  where check_id = new.id and user_id = new.user_id and status = 'ok'
  order by created_at desc
  limit 1;
  if run.id is null then
    raise exception 'Progress check % has no run', new.id using errcode = '42501';
  end if;
  new.score := (run.result ->> 'score')::int;
  new.group_scores := run.result -> 'groupScores';
  new.metrics := run.result -> 'metrics';
  new.created_at := run.created_at;
  return new;
end;
$$;

alter function public.keep_body_check_values() rename to keep_progress_check_values;
alter trigger keep_body_check_values on public.progress_checks
  rename to keep_progress_check_values;

alter function public.start_body_check_analysis(uuid, uuid, int) rename to start_progress_check_run;

-- Takes one of the user's runs for the last 24 hours ('pending'), or returns null when they are
-- used up. Only the assess-progress Edge Function (service role) calls it.
create or replace function public.start_progress_check_run(
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
    select count(*) from public.progress_check_runs
    where user_id = p_user_id and created_at > now() - interval '24 hours'
  ) >= p_daily_limit then
    return null;
  end if;
  insert into public.progress_check_runs (user_id, check_id, status)
  values (p_user_id, p_check_id, 'pending')
  returning id into slot;
  return slot;
end;
$$;

-- The photos move to a bucket named for them. Files can only be moved or deleted through the
-- Storage API, so the ones from before (test photos; there are no users yet) stay in the old
-- bucket, which can be deleted in the dashboard.
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

drop policy "own files" on storage.objects;
create policy "own files" on storage.objects for all to authenticated
  using (
    bucket_id in ('ticket-attachments', 'progress-photos')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id in ('ticket-attachments', 'progress-photos')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
