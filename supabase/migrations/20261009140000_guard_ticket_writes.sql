-- Closes the gaps left by the first support lock: new tickets must start open, ticket
-- numbers only come from the sequence, and messages only go into the user's own tickets.

-- Clients never send a number (PowerSync omits null columns), so the server always assigns it.
alter table public.tickets alter column number set generated always;
alter table public.tickets add constraint tickets_number_key unique (number);

create or replace function public.guard_ticket_update() returns trigger
language plpgsql set search_path = '' as $$
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
  -- Updates: users may only reopen a resolved or closed ticket.
  if new.user_id is distinct from old.user_id
    or new.number is distinct from old.number
    or new.kind is distinct from old.kind
    or new.priority is distinct from old.priority
    or new.subject is distinct from old.subject
    or new.created_at is distinct from old.created_at
    or ((new.status is distinct from old.status or new.closed_at is distinct from old.closed_at)
      and not (old.status in ('resolved', 'closed') and new.status = 'open' and new.closed_at is null))
  then
    raise exception 'Only reopening a ticket is allowed' using errcode = '42501';
  end if;
  return new;
end $$;

drop trigger guard_ticket_update on public.tickets;
create trigger guard_ticket_update before insert or update on public.tickets
  for each row execute function public.guard_ticket_update();

create policy "messages go into own tickets" on public.ticket_messages
  as restrictive for insert to authenticated
  with check (
    exists (
      select 1 from public.tickets t
      where t.id = ticket_id and t.user_id = (select auth.uid())
    )
  );
