-- Tickets are open (waiting for the team) or closed; "planned" and "resolved" go. Replies now
-- reach users in their own language, so what a change means ("we'll build this", "fixed in the
-- next update") goes into a message instead of a status line. The version line on status
-- changes ("Erscheint mit Update 1.4.3") goes with them.
--
-- No real tickets exist yet, so nothing is converted: clear test tickets that use the old
-- statuses before applying it (delete from public.tickets), or the new checks refuse them.

alter table public.tickets drop constraint tickets_status_check;
alter table public.tickets
  add constraint tickets_status_check check (status in ('open', 'closed'));
alter table public.ticket_events drop constraint ticket_events_status_check;
alter table public.ticket_events
  add constraint ticket_events_status_check check (status in ('open', 'closed'));

alter table public.ticket_events drop column version;

-- Applies an event to its ticket (unchanged apart from the statuses). Runs with the inserter's
-- rights, so a user's reopen still passes the tickets policies and guard_ticket_update.
create or replace function public.apply_ticket_event() returns trigger
language plpgsql set search_path = '' as $$
declare
  next_status text := case when new.kind = 'reopened' then 'open' else new.status end;
begin
  update public.tickets
  set status = next_status,
      closed_at = case when next_status = 'closed' then new.created_at end,
      updated_at = new.created_at
  where id = new.ticket_id;
  return new;
end $$;

-- What the user sent stays as sent. Users may only reopen a closed ticket; the support account
-- sets either status (through ticket_events). Unchanged apart from the statuses; see
-- 20261101090000_support_desk.sql for why the support check is written out.
create or replace function public.guard_ticket_update() returns trigger
language plpgsql set search_path = '' as $$
declare
  support boolean := coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'support', false);
begin
  if (select auth.role()) <> 'authenticated' then
    return new;
  end if;
  if tg_op = 'INSERT' then
    if new.status <> 'open' or new.closed_at is not null
      or (new.kind = 'bug' and new.priority is not null) then
      raise exception 'New tickets start open' using errcode = '42501';
    end if;
    return new;
  end if;
  if new.user_id is distinct from old.user_id
    or new.number is distinct from old.number
    or new.kind is distinct from old.kind
    or new.priority is distinct from old.priority
    or new.subject is distinct from old.subject
    or new.created_at is distinct from old.created_at
    or new.platform is distinct from old.platform
    or new.os_version is distinct from old.os_version
    or new.device_model is distinct from old.device_model
    or new.app_version is distinct from old.app_version
    or (
      not support
      and (new.status is distinct from old.status or new.closed_at is distinct from old.closed_at)
      and not (old.status = 'closed' and new.status = 'open' and new.closed_at is null)
    )
  then
    raise exception 'Only reopening a ticket is allowed' using errcode = '42501';
  end if;
  return new;
end $$;
