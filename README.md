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
