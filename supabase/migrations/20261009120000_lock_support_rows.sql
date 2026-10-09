-- Support rows stay under the team's control: users append messages and may reopen
-- their own tickets, nothing else. Team replies and status changes come from the server.

-- Messages are append-only for users (team replies carry the owner's user_id).
create policy "messages are append-only" on public.ticket_messages
  as restrictive for update to authenticated using (false);
create policy "messages are permanent" on public.ticket_messages
  as restrictive for delete to authenticated using (false);

create policy "tickets are permanent" on public.tickets
  as restrictive for delete to authenticated using (false);

-- On tickets users may only reopen: status back to 'open', closed_at cleared, updated_at.
create function public.guard_ticket_update() returns trigger
language plpgsql set search_path = '' as $$
begin
  if (select auth.role()) = 'authenticated' and (
    new.user_id is distinct from old.user_id
    or new.number is distinct from old.number
    or new.kind is distinct from old.kind
    or new.priority is distinct from old.priority
    or new.subject is distinct from old.subject
    or new.created_at is distinct from old.created_at
    or (new.status is distinct from old.status and new.status <> 'open')
    or (new.closed_at is distinct from old.closed_at and new.closed_at is not null)
  ) then
    raise exception 'Only reopening a ticket is allowed' using errcode = '42501';
  end if;
  return new;
end $$;

create trigger guard_ticket_update before update on public.tickets
  for each row execute function public.guard_ticket_update();
