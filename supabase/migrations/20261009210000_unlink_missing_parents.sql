-- A workout or template created offline can reference an optional parent (its template or
-- collection) that another device deleted in the meantime. The "parent is own" policies then
-- reject the row, and the PowerSync connector discards the whole transaction with it (e.g. the
-- workout with all its sets). These triggers unlink such a parent instead. They run as the
-- caller, so another user's row, hidden by RLS, counts as missing too.

create function private.unlink_missing_parent() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare
  -- Trigger arguments: the reference column and the parent table.
  parent_id uuid := (to_jsonb(new) ->> tg_argv[0])::uuid;
  parent_exists boolean;
begin
  execute format('select exists (select 1 from public.%I where id = $1)', tg_argv[1])
    into parent_exists using parent_id;
  if not parent_exists then
    new := jsonb_populate_record(new, jsonb_build_object(tg_argv[0], null));
  end if;
  return new;
end $$;

-- profiles.active_collection_id had no foreign key, so a dangling id made every later profile
-- write fail the "parent is own" policy. Drop those ids and add the key.
update public.profiles p set active_collection_id = null
where active_collection_id is not null and not exists (
  select 1 from public.collections c where c.id = p.active_collection_id and c.user_id = p.user_id
);

alter table public.profiles
  add foreign key (active_collection_id) references public.collections (id) on delete set null;
create index on public.profiles (active_collection_id);

create trigger unlink_missing_template before insert or update on public.workouts
  for each row when (new.template_id is not null)
  execute function private.unlink_missing_parent('template_id', 'templates');

create trigger unlink_missing_collection before insert or update on public.templates
  for each row when (new.collection_id is not null)
  execute function private.unlink_missing_parent('collection_id', 'collections');

create trigger unlink_missing_collection before insert or update on public.profiles
  for each row when (new.active_collection_id is not null)
  execute function private.unlink_missing_parent('active_collection_id', 'collections');
