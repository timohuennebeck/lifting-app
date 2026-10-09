-- Remote app config and versioned legal documents. Both are read before sign-up (onboarding
-- runs logged out), so the app fetches them through the Supabase API with the anon key;
-- only the acceptances sync through PowerSync. The team writes config and documents with
-- the service role.

create schema if not exists private;

create function private.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- A published document never changes; a fix ships as a new version.
create function private.reject_legal_mutation() returns trigger
language plpgsql set search_path = '' as $$
begin
  raise exception 'Legal documents are immutable, publish a new version instead'
    using errcode = '42501';
end $$;

-- Acceptances are legal records: the server sets the time, not the device.
create function private.stamp_legal_acceptance() returns trigger
language plpgsql set search_path = '' as $$
begin
  if (select auth.role()) = 'authenticated' then
    new.accepted_at = now();
  end if;
  return new;
end $$;

create type public.legal_doc_kind as enum ('terms', 'privacy');
create type public.platform as enum ('ios', 'android');

-- Public to every app install, so never store secrets here.
create table public.app_config (
  key text not null,
  value jsonb not null,
  description text not null,
  updated_at timestamptz not null default now(),
  constraint app_config_pkey primary key (key)
);

create trigger app_config_updated_at before update on public.app_config
  for each row execute function private.set_updated_at();

create table public.legal_documents (
  id uuid not null default gen_random_uuid(),
  kind public.legal_doc_kind not null,
  locale text not null default 'pt-BR' check (locale in ('en', 'de', 'pt-PT', 'pt-BR')),
  version text not null,
  content_md text not null,
  effective_at timestamptz not null,
  -- Users who accepted an older version must accept this one before continuing.
  requires_reacceptance boolean not null default false,
  constraint legal_documents_pkey primary key (id),
  constraint legal_documents_kind_locale_version_key unique (kind, locale, version)
);

create trigger legal_documents_immutable before delete or update on public.legal_documents
  for each row execute function private.reject_legal_mutation();

-- profiles.id is the auth user id, so profile_id = auth.uid() identifies the owner.
create table public.legal_acceptances (
  id uuid not null default gen_random_uuid(),
  profile_id uuid not null,
  document_id uuid not null,
  accepted_at timestamptz not null default now(),
  app_version text,
  platform public.platform,
  constraint legal_acceptances_pkey primary key (id),
  constraint legal_acceptances_profile_id_document_id_key unique (profile_id, document_id),
  constraint legal_acceptances_document_id_fkey foreign key (document_id)
    references public.legal_documents (id),
  constraint legal_acceptances_profile_id_fkey foreign key (profile_id)
    references public.profiles (id) on delete cascade
);

create index legal_acceptances_document_id_idx on public.legal_acceptances (document_id);

create trigger legal_acceptances_stamp before insert on public.legal_acceptances
  for each row execute function private.stamp_legal_acceptance();

alter table public.app_config enable row level security;
alter table public.legal_documents enable row level security;
alter table public.legal_acceptances enable row level security;

create policy "anyone reads config" on public.app_config for select to anon, authenticated
  using (true);

create policy "anyone reads legal documents" on public.legal_documents
  for select to anon, authenticated using (true);

-- No update or delete policy: an acceptance is permanent (it goes with the account).
create policy "read own acceptances" on public.legal_acceptances for select to authenticated
  using ((select auth.uid()) = profile_id);

create policy "accept for yourself" on public.legal_acceptances for insert to authenticated
  with check ((select auth.uid()) = profile_id);

alter publication powersync add table public.legal_acceptances;
