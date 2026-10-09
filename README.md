# Forge

Workout logger built with Expo Router, Supabase, PowerSync and Uniwind. The original
Claude Design handoff (prototype, chat transcript, assets) lives in [`design/`](design/README.md).

## Stack

- **Expo SDK 57** with Expo Router, protected routes and native tabs
- **Supabase** (local development) for auth and Postgres
- **PowerSync** for local-first SQLite sync, read through **TanStack Query** (`@powersync/tanstack-react-query`)
- **Drizzle ORM** (`@powersync/drizzle-driver`) for typed queries; `src/shared/data/powersync/schema.ts` is the client schema
- **Uniwind** (Tailwind v4) with `tailwind-merge` via `cn()`
- **Zustand** + **MMKV** for global and persisted client state
- **i18next** with `en` (source), `de`, `pt-PT`, `pt-BR`

## Getting started

```bash
npm install
cp .env.example .env

# Supabase (Docker required); generate the ES256 signing key once
npm run supabase:keys           # writes supabase/signing_key.json (gitignored)
npm run supabase:start          # copy the publishable key into .env

# PowerSync service, joined to the Supabase docker network
npm run powersync:up

# Native modules (MMKV, op-sqlite) need a development build, not Expo Go
npm run ios   # or npm run android
```

## Project structure

```
src/
  app/                 Expo Router routes only (thin files re-exporting feature screens)
  features/<feature>/  components, screens, data, hooks, lib, stores per feature
  shared/              ui primitives, components, data layer, i18n, lib, stores
supabase/              config + migrations (RLS, PowerSync publication)
powersync/             self-hosted service config, sync streams, docker compose
```

## Scripts

`npm run typecheck`, `npm run lint`, `npm run format`, `npm run supabase:reset`.

## Support tickets (team side)

Users write `tickets` and `ticket_messages` from the app. The team works with the service role:

- **Reply:** insert into `ticket_messages` with `author = 'team'` and the ticket owner's `user_id`, written in
  the owner's `profiles.language`.
- **Change status:** insert into `ticket_events` with `kind = 'status'` and the new `status`. A trigger mirrors it
  onto `tickets.status`. Optional: `version` (e.g. `'1.4.3'`), which the app shows translated ("Erscheint mit
  Update 1.4.3" / "Coming in update 1.4.3"), or `note` for custom text, shown as written (not translated).
- Users can only reopen (logged as `kind = 'reopened'`); messages are append-only.

## Exercise catalog (team side)

Exercises live in `public.exercises`. Every install reads them, also logged out, and the app pulls
changes hourly, so new exercises ship without a release. Edit them with the service role.

- **`id`:** a slug such as `bench-press`. Workouts store it, so never rename or delete an exercise; set
  `is_active = false` to hide it from the picker while history keeps its name.
- **`name` / `instructions`:** per language (`en`, `de`, `pt-PT`, `pt-BR`); English is required and
  the fallback. Instructions are a list of `{ "title", "text" }` steps.
- **`equipment`, `muscles`:** codes the app translates. `muscles` maps body map regions to their
  share of the work, e.g. `{"chest": 0.6, "triceps": 0.25, "front_delts": 0.15}`.
- **`measures`:** what one set records, and so which boxes the workout screen shows:
  `{weight,reps}` (kg × reps, also bodyweight moves with added weight), `{reps}` (push-ups),
  `{seconds}` (planks) or `{weight,seconds}` (weighted holds).
- **`image_path`:** a file in the public `exercise-media` bucket. `supabase seed buckets` uploads the
  bundled photos (`--linked` for the hosted project).
- **Before a release:** `npm run catalog:pull` refreshes the snapshot the app ships for its first
  launch (`src/shared/data/exercise-catalog.json`).

## App config and legal documents (team side)

Both are readable without an account (onboarding runs logged out) and written with the service role.

- **`app_config`:** one jsonb `value` per `key`. Every install can read it, so never store secrets there.
- **`legal_documents`:** one row per `kind` (`terms`, `privacy`), `locale` and `version`, as Markdown. Rows
  can't be edited or deleted; publish a new `version` instead. Set `requires_reacceptance` when users who
  accepted an older version have to accept again.
- **`legal_acceptances`:** written by the app for the signed-in user; the server sets `accepted_at`.
- **In the app:** `/legal/terms` and `/legal/privacy` show the version in effect, in the app language
  (else English, else `pt-BR`), linked from the sign-up screen and Settings. Write the text as Markdown:
  headings, paragraphs, `>` quotes, lists, `**bold**` and `[links](https://…)`. Locally,
  `supabase/seed.sql` adds placeholder documents on `npm run supabase:reset`.

## Languages

The app language is mirrored to `profiles.language` (for the team) and to the auth user metadata
(`user_metadata.language`). The account emails in `supabase/templates/` (confirmation, password
reset, email change) pick their text from it. `config.toml` applies them locally; for the hosted
project run `supabase config push` or paste them under Auth → Email Templates.
