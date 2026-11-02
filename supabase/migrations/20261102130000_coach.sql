-- The AI coach (README, "Coach"): its chats and their messages, which only the coach-chat Edge
-- Function writes and PowerSync syncs to the app, where users read and delete them; the runs that
-- limit how often a user asks and record what each answer cost; and when the user agreed to their
-- training and body data going to OpenAI.

alter table public.profiles add column coach_consent_at timestamptz;

create table public.coach_chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  -- The last answer's time: the chat list's order and grouping.
  updated_at timestamptz not null default now()
);

create index on public.coach_chats (user_id, updated_at desc);

create table public.coach_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.coach_chats (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'coach')),
  -- Questions as long as limits.ts allows (COACH_QUESTION_MAX); answers are a few sentences.
  content text not null check (
    char_length(content) between 1 and (case role when 'user' then 500 else 2000 end)
  ),
  -- The chart under an answer as it was computed then (coach/tools.ts, Chart).
  chart jsonb check (chart is null or (role = 'coach' and jsonb_typeof(chart) = 'object')),
  created_at timestamptz not null default now()
);

create index on public.coach_messages (chat_id, created_at);
create index on public.coach_messages (user_id);

-- One per question asked, server-only. It stays when its chat is deleted, so deleting chats
-- doesn't reset the limits.
create table public.coach_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  chat_id uuid references public.coach_chats (id) on delete set null,
  -- The answer it gave; its tool calls (`calls`) are replayed for follow-up questions.
  answer_id uuid references public.coach_messages (id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'ok', 'failed', 'refused')),
  calls jsonb,
  model text,
  fast boolean,
  input_tokens int,
  cached_tokens int,
  output_tokens int,
  ms int,
  created_at timestamptz not null default now()
);

create index on public.coach_runs (user_id, created_at desc);
create index on public.coach_runs (chat_id);
create index on public.coach_runs (answer_id);

alter table public.coach_chats enable row level security;
alter table public.coach_messages enable row level security;
-- No policies: the app can neither read nor write it.
alter table public.coach_runs enable row level security;

-- Users read and delete their own; only the Edge Function (service role) writes.
create policy "read own coach chats" on public.coach_chats
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "delete own coach chats" on public.coach_chats
  for delete to authenticated using ((select auth.uid()) = user_id);
create policy "read own coach messages" on public.coach_messages
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "delete own coach messages" on public.coach_messages
  for delete to authenticated using ((select auth.uid()) = user_id);

alter publication powersync add table public.coach_chats, public.coach_messages;

-- Takes one of the user's question slots (a 'pending' run) and returns {"run": id}, or past a
-- limit {"limit": "daily" | "monthly", "retry_at": …}: when enough questions have left the
-- window (24 hours or 30 days) for the next one. One request per user decides at a time, so two
-- can't both take the last slot.
create function public.start_coach_run(
  p_user_id uuid,
  p_chat_id uuid,
  p_daily_limit int,
  p_monthly_limit int
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  day_count int;
  month_count int;
  slot uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended('coach:' || p_user_id::text, 0));
  select
    count(*) filter (where created_at > now() - interval '24 hours'),
    count(*)
  into day_count, month_count
  from public.coach_runs
  where user_id = p_user_id and created_at > now() - interval '30 days';
  if day_count >= p_daily_limit then
    return jsonb_build_object('limit', 'daily', 'retry_at', (
      select created_at + interval '24 hours' from public.coach_runs
      where user_id = p_user_id and created_at > now() - interval '24 hours'
      order by created_at offset day_count - p_daily_limit limit 1
    ));
  end if;
  if month_count >= p_monthly_limit then
    return jsonb_build_object('limit', 'monthly', 'retry_at', (
      select created_at + interval '30 days' from public.coach_runs
      where user_id = p_user_id and created_at > now() - interval '30 days'
      order by created_at offset month_count - p_monthly_limit limit 1
    ));
  end if;
  insert into public.coach_runs (user_id, chat_id) values (p_user_id, p_chat_id)
  returning id into slot;
  return jsonb_build_object('run', slot);
end;
$$;

-- The user's training for the coach in one answer (the API returns at most 1,000 rows a query):
-- finished workouts, oldest first, with their completed sets as [weight_kg, reps, seconds, rir];
-- body weight as [date, kg]; body check scores as [time, score]; and the catalog and custom
-- exercises the workouts use.
create function public.coach_history(p_user_id uuid)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select jsonb_build_object(
    'workouts', coalesce((
      select jsonb_agg(jsonb_build_object(
        'name', w.name,
        'started_at', w.started_at,
        'finished_at', w.finished_at,
        'exercises', coalesce((
          select jsonb_agg(jsonb_build_object(
            'exercise_id', e.exercise_id,
            'sets', coalesce((
              select jsonb_agg(
                jsonb_build_array(s.weight_kg, s.reps, s.seconds, s.rir) order by s.position
              )
              from public.workout_entries_sets s
              where s.workout_entries_exercise_id = e.id and s.completed_at is not null
            ), '[]')
          ) order by e.position)
          from public.workout_entries_exercises e
          where e.workout_entries_id = w.id
        ), '[]')
      ) order by w.started_at)
      from public.workout_entries w
      where w.user_id = p_user_id and w.finished_at is not null
    ), '[]'),
    'weights', coalesce((
      select jsonb_agg(jsonb_build_array(date, weight_kg) order by date)
      from public.weight_entries
      where user_id = p_user_id
    ), '[]'),
    'checks', coalesce((
      select jsonb_agg(jsonb_build_array(created_at, score) order by created_at)
      from public.progress_checks
      where user_id = p_user_id
    ), '[]'),
    'exercises', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', x.id,
        'name', x.name,
        'measures', to_jsonb(x.measures),
        'muscles', x.muscles,
        'equipment', x.equipment,
        'assisted', x.assisted,
        'cardio', x.cardio
      ))
      from public.exercises x
      where x.id in (
        select e.exercise_id from public.workout_entries_exercises e where e.user_id = p_user_id
      )
    ), '[]'),
    'custom_exercises', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', c.id,
        'name', c.name,
        'measures', c.measures,
        'primary', c.primary_muscles,
        'secondary', c.secondary_muscles
      ))
      from public.custom_exercises c
      where c.user_id = p_user_id
    ), '[]')
  )
$$;

-- Saves a question with its answer once the answer is complete, all or nothing: the chat (when
-- new) and its time, both messages, and the run's tool calls and usage.
create function public.save_coach_answer(
  p_run_id uuid,
  p_user_id uuid,
  p_chat_id uuid,
  p_question_id uuid,
  p_question text,
  p_asked_at timestamptz,
  p_answer_id uuid,
  p_answer text,
  p_chart jsonb,
  p_calls jsonb,
  p_usage jsonb
)
returns void
language plpgsql
set search_path = ''
as $$
begin
  if exists (select 1 from public.coach_chats where id = p_chat_id and user_id <> p_user_id) then
    raise exception 'Chat % belongs to another user', p_chat_id using errcode = '42501';
  end if;
  insert into public.coach_chats (id, user_id, created_at) values (p_chat_id, p_user_id, p_asked_at)
  on conflict (id) do update set updated_at = now();
  insert into public.coach_messages (id, chat_id, user_id, role, content, created_at)
  values (p_question_id, p_chat_id, p_user_id, 'user', p_question, p_asked_at);
  insert into public.coach_messages (id, chat_id, user_id, role, content, chart)
  values (p_answer_id, p_chat_id, p_user_id, 'coach', p_answer, p_chart);
  update public.coach_runs set
    status = 'ok',
    chat_id = p_chat_id,
    answer_id = p_answer_id,
    calls = p_calls,
    model = p_usage ->> 'model',
    fast = (p_usage ->> 'fast')::boolean,
    input_tokens = (p_usage ->> 'input')::int,
    cached_tokens = (p_usage ->> 'cached')::int,
    output_tokens = (p_usage ->> 'output')::int,
    ms = (p_usage ->> 'ms')::int
  where id = p_run_id and user_id = p_user_id;
end;
$$;

-- Only the coach-chat Edge Function (service role) calls these.
revoke execute on function public.start_coach_run(uuid, uuid, int, int)
  from public, anon, authenticated;
revoke execute on function public.coach_history(uuid) from public, anon, authenticated;
revoke execute on function public.save_coach_answer(
  uuid, uuid, uuid, uuid, text, timestamptz, uuid, text, jsonb, jsonb, jsonb
) from public, anon, authenticated;
grant execute on function public.start_coach_run(uuid, uuid, int, int) to service_role;
grant execute on function public.coach_history(uuid) to service_role;
grant execute on function public.save_coach_answer(
  uuid, uuid, uuid, uuid, text, timestamptz, uuid, text, jsonb, jsonb, jsonb
) to service_role;
