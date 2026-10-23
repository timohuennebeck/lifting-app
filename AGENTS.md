# Loqqa: notes for AI agents

Workout logger for iOS and Android on Expo SDK 57 (no web build). Expo's APIs change with every
SDK: read the docs for this version (https://docs.expo.dev/versions/v57.0.0/, index with
corrections at https://docs.expo.dev/llms.txt), not memory. Add packages with
`npx expo install <package>`; native ones need a new development build (`npm run ios|android`, not
Expo Go). `ios/` and `android/` are generated: configure native behaviour in `app.json` and
`app.config.ts`. `README.md` covers the product, setup and the team-side data.

## Where things go

- `src/app/**`: Expo Router routes only (typed routes, NativeTabs); screen files re-export a
  screen from `src/features/<feature>/screens/`, `_layout.tsx` files set up the navigators. The
  plan flow is mounted twice: `(onboarding)/` and `(app)/plan/`.
- `src/features/<feature>/{components,screens,data,hooks,lib,stores}`: code one feature uses.
- `src/shared/`: code several features use. `ui` holds presentational primitives, `components`
  app-level composed pieces, `data` the shared data layer; then `hooks`, `lib`, `stores`, `i18n`,
  `config`. Code only one feature uses belongs in that feature.
- `supabase/`: migrations, Edge Functions (Deno, shared code in `functions/_shared/`, outside tsc
  and ESLint) and the auth email templates (one branch per app language). `powersync/`: the
  service config and what syncs.

## Data

- Never edit a file in `supabase/migrations/`: it may already be applied. Add a new migration.
- Synced tables: PowerSync (local SQLite) + Drizzle. A table or column change needs a migration
  (`alter publication powersync add table …` for a new table), `powersync/sync-config.yaml`,
  `src/shared/data/powersync/schema.ts`, and in `connector.ts` `JSON_COLUMNS` (jsonb) or
  `APPEND_ONLY_TABLES` where they apply.
- Read with `useDrizzleQuery`, a key from `src/shared/data/query-keys.ts` (or the feature's own
  key factory) and a module-level `map`; the query re-runs when its tables change.
- The database checks mirror `src/shared/lib/limits.ts`. An upload the server rejects is dropped
  whole (`connector.ts`).
- The exercise catalog isn't synced: it is kept in MMKV and refreshed by `useCatalogRefresh`.
  Render code reads exercises with `useExercise` / `useExerciseName`, not `getExercise`.
- Client state: zustand + MMKV (`src/shared/lib/storage.ts`).
- Edge Function, `supabase/config.toml` and template changes reach the hosted project only with a
  function deploy or `supabase config push`.

## i18n

Texts live in `src/shared/i18n/locales/<lang>/<namespace>.json`. `en` is the source and its keys
are type-checked; `en`, `de`, `pt-PT`, `pt-BR` and `ko` keep identical keys, so add each key to all
five. Run `npx prettier --write` on edited JSON. Keys read with `returnObjects` look unused to
scanners.

## Conventions

Files kebab-case; `interface` for object shapes (ESLint enforces it). Styling with Uniwind
`className` and `cn()`; raw colours from `src/shared/lib/theme.ts`, which mirrors
`src/global.css`. Comments say what the code does in at most six lines, without history.

## React Compiler

It silently skips a component or hook it can't compile, which then loses its memoization. Avoid
try/finally in components, a logical expression (`a && b`, `a ?? b`) as the test of a ternary
(compute the value first), `??` or `?.` inside a try block, and `new` in a default parameter.
ESLint forbids `obj.x++` (miscompiled).

## Checks

```bash
npx tsc --noEmit -p .
npm run lint
npm run -s compiler:check   # must list no skipped components or hooks
npx prettier --check <changed files>
```

## Keep

`react-native-pager-view` and `react-native-tab-view`: expo-router's top tabs need them, although
nothing imports them. `*.web.ts(x)` files only serve a local screenshot preview.
