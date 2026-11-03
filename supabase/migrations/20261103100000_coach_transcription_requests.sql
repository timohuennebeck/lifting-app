-- Speech to text for the coach's field (coach-transcribe) is limited like voice input, as its own
-- kind of plan_requests. Its key is a hash of the user's id rather than of the network: only
-- signed-in users get there, so the limit per key is a limit per user.

alter table public.plan_requests drop constraint plan_requests_kind_check;
alter table public.plan_requests
  add constraint plan_requests_kind_check
  check (kind in ('import', 'generate', 'voice', 'transcribe'));
