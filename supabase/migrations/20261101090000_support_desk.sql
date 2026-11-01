-- The support desk (lifting-app-customer-support) signs in as one account whose
-- app_metadata.role is 'support'. That account reads every ticket with its messages, events and
-- screenshots, answers as the team and sets statuses; it never changes what a user wrote.
-- Tickets also record the device and app version they were sent from.

-- True for the support account. Only the service role sets app_metadata (users can't).
create function private.is_support() returns boolean
language sql stable set search_path = '' as $$
  select coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'support', false)
$$;

-- Where a ticket came from, sent by the app when it creates the ticket ("iPhone 16 Pro",
-- "26.1", "1.4.2"); null on tickets from older app versions.
alter table public.tickets
  add column platform public.platform,
  add column os_version text,
  add column device_model text,
  add column app_version text,
  add constraint tickets_os_version_length check (char_length(os_version) <= 40),
  add constraint tickets_device_model_length check (char_length(device_model) <= 80),
  add constraint tickets_app_version_length check (char_length(app_version) <= 40);

-- What the user sent stays as sent. Users may only reopen; the support account sets any
-- status (through ticket_events, whose trigger mirrors it onto the ticket). The check is
-- private.is_support() written out: users have no access to the private schema, and PL/pgSQL
-- resolves names when it runs, as them.
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
      and not (old.status in ('resolved', 'closed') and new.status = 'open' and new.closed_at is null)
    )
  then
    raise exception 'Only reopening a ticket is allowed' using errcode = '42501';
  end if;
  return new;
end $$;

-- Tickets: the support account reads all and updates them (the guard above limits how).
create policy "support reads tickets" on public.tickets for select to authenticated
  using ((select private.is_support()));
create policy "support updates tickets" on public.tickets for update to authenticated
  using ((select private.is_support())) with check ((select private.is_support()));

-- Messages: users write as 'user' into their own tickets, the support account as 'team' into
-- any ticket, with the owner's user_id so the reply syncs to them.
create policy "support reads messages" on public.ticket_messages for select to authenticated
  using ((select private.is_support()));
create policy "support answers" on public.ticket_messages for insert to authenticated
  with check ((select private.is_support()));

drop policy "users write user messages" on public.ticket_messages;
create policy "users write user messages, support team messages" on public.ticket_messages
  as restrictive for insert to authenticated
  with check (author = case when (select private.is_support()) then 'team' else 'user' end);

drop policy "messages go into own tickets" on public.ticket_messages;
create policy "messages go into the owner's tickets" on public.ticket_messages
  as restrictive for insert to authenticated
  with check (
    exists (
      select 1 from public.tickets t
      where t.id = ticket_messages.ticket_id
        and t.user_id = ticket_messages.user_id
        and (t.user_id = (select auth.uid()) or (select private.is_support()))
    )
  );

-- Events: the support account reads all and logs status changes, with the owner's user_id.
create policy "support reads events" on public.ticket_events for select to authenticated
  using ((select private.is_support()));
create policy "support sets statuses" on public.ticket_events for insert to authenticated
  with check (
    (select private.is_support())
    and kind = 'status'
    and exists (
      select 1 from public.tickets t
      where t.id = ticket_events.ticket_id and t.user_id = ticket_events.user_id
    )
  );

-- Screenshots: the support account opens them (signed URLs need read access).
create policy "support reads ticket files" on storage.objects for select to authenticated
  using (bucket_id = 'ticket-attachments' and (select private.is_support()));

-- How far the support account has read each ticket: the last user activity it saw. Support
-- only, and not synced to the app.
create table public.support_ticket_reads (
  ticket_id uuid primary key references public.tickets (id) on delete cascade,
  read_at timestamptz not null
);

alter table public.support_ticket_reads enable row level security;

create policy "support only" on public.support_ticket_reads for all to authenticated
  using ((select private.is_support())) with check ((select private.is_support()));

-- The desk's inbox: each ticket with its last message, the user's last activity (a message
-- or a reopen) and whether that came after the support account last read the ticket.
create view public.support_inbox with (security_invoker = true) as
select
  t.id,
  t.number,
  t.user_id,
  t.kind,
  t.status,
  t.priority,
  t.subject,
  t.platform,
  t.os_version,
  t.device_model,
  t.app_version,
  t.created_at,
  t.updated_at,
  t.closed_at,
  last.author as last_author,
  left(last.content, 200) as last_preview,
  greatest(last.created_at, t.updated_at) as last_activity_at,
  activity.at as user_activity_at,
  r.read_at,
  activity.at > coalesce(r.read_at, '-infinity') as unread
from public.tickets t
left join lateral (
  select m.author, m.content, m.created_at
  from public.ticket_messages m
  where m.ticket_id = t.id
  order by m.created_at desc
  limit 1
) last on true
left join lateral (
  select greatest(
    (select max(m.created_at) from public.ticket_messages m
      where m.ticket_id = t.id and m.author = 'user'),
    (select max(e.created_at) from public.ticket_events e
      where e.ticket_id = t.id and e.kind = 'reopened')
  ) as at
) activity on true
left join public.support_ticket_reads r on r.ticket_id = t.id
where (select private.is_support());

-- The people behind the tickets, with what only auth knows (email, sign-in method, last
-- activity: a token refresh counts). Empty for anyone but the support account.
create function public.support_customers()
returns table (
  user_id uuid,
  first_name text,
  language text,
  email text,
  provider text,
  signed_up_at timestamptz,
  last_active_at timestamptz
)
language sql stable security definer set search_path = '' as $$
  select
    u.id,
    p.first_name,
    p.language,
    u.email::text,
    case when u.is_anonymous then 'anonymous' else u.raw_app_meta_data ->> 'provider' end,
    u.created_at,
    greatest(
      u.last_sign_in_at,
      (select max(s.updated_at) from auth.sessions s where s.user_id = u.id) at time zone 'utc'
    )
  from auth.users u
  left join public.profiles p on p.user_id = u.id
  where private.is_support()
    and exists (select 1 from public.tickets t where t.user_id = u.id)
$$;

revoke execute on function public.support_customers() from public, anon;
grant execute on function public.support_customers() to authenticated;

-- The desk refreshes when tickets, messages or statuses change (Supabase Realtime, which checks
-- the policies above for each listener).
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime
      add table public.tickets, public.ticket_messages, public.ticket_events;
  end if;
end $$;
