-- An answer for a chat the user deleted while it was being written is not saved: before, the
-- answer created the chat again. A new chat is created with its first answer; an existing one has
-- to still be there (and the user's), or nothing is saved.
drop function public.save_coach_answer(
  uuid, uuid, uuid, uuid, text, timestamptz, uuid, text, jsonb, jsonb, jsonb
);

create function public.save_coach_answer(
  p_run_id uuid,
  p_user_id uuid,
  p_chat_id uuid,
  p_new_chat boolean,
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
  if p_new_chat then
    insert into public.coach_chats (id, user_id, created_at) values (p_chat_id, p_user_id, p_asked_at);
  else
    update public.coach_chats set updated_at = now()
    where id = p_chat_id and user_id = p_user_id;
    if not found then
      raise exception 'Chat % is gone', p_chat_id using errcode = 'P0002';
    end if;
  end if;
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

revoke execute on function public.save_coach_answer(
  uuid, uuid, uuid, boolean, uuid, text, timestamptz, uuid, text, jsonb, jsonb, jsonb
) from public, anon, authenticated;
grant execute on function public.save_coach_answer(
  uuid, uuid, uuid, boolean, uuid, text, timestamptz, uuid, text, jsonb, jsonb, jsonb
) to service_role;
