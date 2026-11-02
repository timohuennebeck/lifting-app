-- A deleted coach chat takes the data its answers looked up with it: its runs keep only what the
-- limits and the cost overview need (time, status, model, tokens, duration), not the tool calls
-- with the user's training data in them.
create function private.forget_coach_chat()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.coach_runs set calls = null where chat_id = old.id;
  return old;
end;
$$;

create trigger forget_coach_chat before delete on public.coach_chats
  for each row execute function private.forget_coach_chat();
