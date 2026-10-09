-- Status history of support tickets, shown as lines in the chat ("Status: Geplant ·
-- Erscheint mit Update 1.4.3"). The team changes a ticket's status by inserting an event;
-- a trigger mirrors it onto tickets.status. Users can only log that they reopened a ticket.

create table public.ticket_events (
  id uuid primary key default gen_random_uuid(),
  -- The ticket owner, also on team events, so the history syncs to them.
  user_id uuid not null references auth.users (id) on delete cascade,
  ticket_id uuid not null references public.tickets (id) on delete cascade,
  kind text not null check (kind in ('status', 'reopened')),
  status text check (status in ('open', 'planned', 'resolved', 'closed')),
  -- Optional text for the user, e.g. "Erscheint mit Update 1.4.3".
  note text,
  created_at timestamptz not null default now(),
  -- Status events name the new status; a reopen always means 'open'.
  check ((kind = 'status') = (status is not null))
);

create index on public.ticket_events (ticket_id, created_at);

alter table public.ticket_events enable row level security;

create policy "read own events" on public.ticket_events for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "users log reopening" on public.ticket_events for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and kind = 'reopened'
    and exists (
      select 1 from public.tickets t
      where t.id = ticket_id and t.user_id = (select auth.uid())
    )
  );

-- Applies an event to its ticket. Runs with the inserter's rights, so a user's reopen
-- still passes the tickets policies and guard_ticket_update.
create function public.apply_ticket_event() returns trigger
language plpgsql set search_path = '' as $$
declare
  next_status text := case when new.kind = 'reopened' then 'open' else new.status end;
begin
  update public.tickets
  set status = next_status,
      closed_at = case when next_status in ('resolved', 'closed') then new.created_at end,
      updated_at = new.created_at
  where id = new.ticket_id;
  return new;
end $$;

create trigger apply_ticket_event after insert on public.ticket_events
  for each row execute function public.apply_ticket_event();

alter publication powersync add table public.ticket_events;
