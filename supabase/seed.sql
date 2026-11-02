-- Local development only (`supabase db reset` runs this; `db push` never does).
-- The legal documents come from the migrations (scripts/legal-migration.mjs).

-- Translations (README, "Translations"): where the database reaches the Edge Functions from its
-- container, and the secret it sends (TRANSLATION_WEBHOOK_SECRET in supabase/functions/.env).
select vault.create_secret('http://host.docker.internal:55321', 'project_url');
select vault.create_secret('local-translation-secret', 'translation_webhook_secret');
