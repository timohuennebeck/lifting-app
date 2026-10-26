-- Voice input (exercises said out loud, read by read-plan) is limited on its own: a short text
-- request, made far more often than a plan import, so it gets its own kind and limits.

alter table public.plan_requests drop constraint plan_requests_kind_check;
alter table public.plan_requests
  add constraint plan_requests_kind_check check (kind in ('import', 'generate', 'voice'));
