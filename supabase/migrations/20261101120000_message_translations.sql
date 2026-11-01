-- Support messages in each reader's language. A message is stored once, as written; the
-- translate-ticket-messages Edge Function detects its language (ticket_messages.language) and
-- adds translations: a user's message into the team's language, a team reply into the user's
-- app language, all of a user's team replies again when they switch the app language, and others
-- the support desk asks for. Translations sync to the user with their messages.

alter table public.ticket_messages
  add column language text,
  add constraint ticket_messages_language_length check (char_length(language) <= 20);

-- One per message and language; `id` because PowerSync syncs rows by it.
create table public.ticket_message_translations (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.ticket_messages (id) on delete cascade,
  -- The ticket owner, also for team replies, so translations sync to them.
  user_id uuid not null references auth.users (id) on delete cascade,
  language text not null check (language in ('en', 'de', 'pt-PT', 'pt-BR', 'ko')),
  content text not null check (char_length(content) <= 10000),
  created_at timestamptz not null default now(),
  unique (message_id, language)
);

create index on public.ticket_message_translations (user_id);

alter table public.ticket_message_translations enable row level security;

-- Read-only for users and the support account; only the Edge Functions (service role) write.
create policy "read own translations" on public.ticket_message_translations
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "support reads translations" on public.ticket_message_translations
  for select to authenticated using ((select private.is_support()));

alter publication powersync add table public.ticket_message_translations;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.ticket_message_translations;
  end if;
end $$;

-- Calls the translation function in the background (pg_net sends it after the commit). Its
-- address and shared secret come from the Vault (README, "Translations"); without them nothing
-- is translated, and messages show as written.
create extension if not exists pg_net;

create function private.request_translation(body jsonb) returns void
language plpgsql security definer set search_path = '' as $$
declare
  base_url text;
  secret text;
begin
  select decrypted_secret into base_url from vault.decrypted_secrets where name = 'project_url';
  select decrypted_secret into secret
  from vault.decrypted_secrets where name = 'translation_webhook_secret';
  if base_url is null or secret is null then
    return;
  end if;
  perform net.http_post(
    url := rtrim(base_url, '/') || '/functions/v1/translate-ticket-messages',
    body := body,
    headers := jsonb_build_object('Content-Type', 'application/json', 'X-Webhook-Secret', secret),
    timeout_milliseconds := 30000
  );
end $$;

revoke execute on function private.request_translation(jsonb) from public;

-- Every new message, from the app or the desk: the function sees which translation it needs
-- (and skips a team reply send-team-reply already translated).
create function private.translate_new_message() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform private.request_translation(jsonb_build_object('message_id', new.id));
  return null;
end $$;

create trigger translate_new_message after insert on public.ticket_messages
  for each row execute function private.translate_new_message();

-- A user switched the app language: their team replies get translated into it, if they have any.
create function private.translate_for_new_language() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.language is not null
    and new.language is distinct from old.language
    and exists (
      select 1 from public.ticket_messages m
      where m.user_id = new.user_id and m.author = 'team'
    )
  then
    perform private.request_translation(
      jsonb_build_object('user_id', new.user_id, 'language', new.language)
    );
  end if;
  return null;
end $$;

create trigger translate_for_new_language after update of language on public.profiles
  for each row execute function private.translate_for_new_language();

-- A team reply with its translation in one transaction, so the user never sees it untranslated
-- first. Only the send-team-reply function (service role) calls it.
create function public.insert_team_reply(
  p_ticket_id uuid,
  p_content text,
  p_language text,
  p_translation_language text,
  p_translation text
) returns uuid
language plpgsql set search_path = '' as $$
declare
  owner uuid;
  new_id uuid;
begin
  select user_id into owner from public.tickets where id = p_ticket_id;
  if owner is null then
    raise exception 'Unknown ticket' using errcode = 'P0002';
  end if;
  insert into public.ticket_messages (user_id, ticket_id, author, content, language)
  values (owner, p_ticket_id, 'team', p_content, p_language)
  returning id into new_id;
  if p_translation_language is not null and p_translation is not null then
    insert into public.ticket_message_translations (message_id, user_id, language, content)
    values (new_id, owner, p_translation_language, p_translation);
  end if;
  return new_id;
end $$;

revoke execute on function public.insert_team_reply(uuid, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.insert_team_reply(uuid, text, text, text, text) to service_role;

-- The desk's inbox also names each ticket's first and last message, whose translations it shows
-- as subject and preview.
create or replace view public.support_inbox with (security_invoker = true) as
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
  activity.at > coalesce(r.read_at, '-infinity') as unread,
  first.id as first_message_id,
  last.id as last_message_id
from public.tickets t
left join lateral (
  select m.id, m.author, m.content, m.created_at
  from public.ticket_messages m
  where m.ticket_id = t.id
  order by m.created_at desc, m.id desc
  limit 1
) last on true
left join lateral (
  select m.id
  from public.ticket_messages m
  where m.ticket_id = t.id
  order by m.created_at, m.id
  limit 1
) first on true
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
