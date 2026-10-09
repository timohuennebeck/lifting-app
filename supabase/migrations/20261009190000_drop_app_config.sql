-- No use case for remote app config yet; drop it until there is one.
-- private.set_updated_at() stays: the exercises table uses it.
drop table public.app_config;
