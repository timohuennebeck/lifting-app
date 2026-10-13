# Traqa

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

# Body check analysis: the Edge Function needs an OpenAI key (see the file)
cp supabase/functions/.env.example supabase/functions/.env

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
supabase/              config, migrations (RLS, PowerSync publication), Edge Functions, email templates
powersync/             self-hosted service config, sync streams, docker compose
```

## Scripts

`npm run typecheck`, `npm run lint`, `npm run format`, `npm run supabase:reset`, `npm run plan:eval`
(plan import test, see below).

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
- **`image_path`:** a file in the public `exercise-media` bucket.
- **In the app:** downloaded in full on first launch (the app needs a connection once), kept on the
  device, then refreshed with the rows changed since, on launch and hourly. A change here reaches
  every install without an app release.

## Legal documents (team side)

Documents are readable without an account (onboarding runs logged out) and written with the service role.

- **`legal_documents`:** one row per `kind` (`terms`, `privacy`), `locale` and `version`, as Markdown. Rows
  can't be edited or deleted; publish a new `version` instead. Set `requires_reacceptance` when users who
  accepted an older version have to accept again.
- **`legal_acceptances`:** one row per accepted document version; the server sets `accepted_at`. The
  app writes them on sign-up (the versions in effect then) and when a user agrees to a version that
  requires re-acceptance; until then that version covers the app, showing what changed.
- **In the app:** `/legal/terms` and `/legal/privacy` show the version in effect, in the app language
  (else English, else `pt-BR`), linked from the sign-up screen and Settings. Write the text as Markdown:
  headings, paragraphs, `>` quotes, lists, `**bold**` and `[links](https://…)`. Locally,
  `supabase/seed.sql` adds placeholder documents on `npm run supabase:reset`.

## Weight tracking

- **`weight_entries`:** one row per user and calendar day: `date` (the user's own day, no time
  zone) and `weight_kg` (always kg, two decimals). The id comes from user and date
  (`private.weight_entry_id`, in the app `weightEntryId`: the first 32 hex digits of SHA-256 of
  `<user id>:<date>`), so two devices saving the same day write one row and the last save wins.
- **In the app:** the scale button in the top bar opens today's entry, which leads on to the
  history and its calendar (oldest month on top, loading more months both ways). The trend is computed on the device: each weigh-in moves it 10 % toward the scale value.
  The onboarding weight becomes the first entry; bodyweight exercise scores and the body check
  analysis use the latest one. `profiles.weight_kg` was moved into the table and dropped.

## Body check analysis

The app uploads the three photos (front, side, back) to the private `body-checks` bucket and calls the
`analyze-body-check` Edge Function, which sends them to OpenAI (`gpt-6.1-sol` by default, via the
standard API at `api.openai.com`) and returns the check's values, or the photos to retake.

- **Secrets:** `supabase/functions/.env` locally (loaded by `supabase start`); in production
  `npx supabase secrets set --env-file supabase/functions/.env`. `OPENAI_API_KEY` is an OpenAI API
  key; `OPENAI_MODEL` overrides the default model.
- **Rules (server-side):** adults only (18+ by the profile's birth date), at most 5 analyses per user in 24 hours.
- **`body_check_analyses`:** one row per analysis, server-only. Saving a check takes its score, values
  and time from the analysis; a check without one is rejected.

## Plan import

In onboarding, users can import their plan from photos or a file (PDF, Excel, CSV, text) instead of
creating one. The app shrinks photos to JPEGs and calls the `analyze-plan` Edge Function, which sends
them to OpenAI together with the exercise catalog and returns the plan in the app's shape: each line
matched to a catalog exercise, or a new exercise the app creates for the user at sign-up. Lines it
isn't sure about come with alternatives for the user to review.

- **Secrets:** the same `OPENAI_API_KEY` and `OPENAI_MODEL` as the body check.
- **Rules (server-side):** it runs before there is an account, so imports are limited per network
  (`PLAN_IMPORT_IP_LIMIT`, default 10) and in total (`PLAN_IMPORT_DAILY_LIMIT`, default 1,000) per
  24 hours. `plan_import_requests` keeps a keyed hash of the IP, never the IP itself.
- **Testing:** `npm run plan:eval` sends the 15 test plans in `scripts/plan-import-eval/fixtures`
  (typed, spreadsheet, handwritten, whiteboard, screenshot; German, English, Portuguese) to the
  function and scores what it read against `cases.json`. `npm run plan:eval -- --dir <folder>` reads
  your own photos and files and prints what it found. One run is 15 imports, so set
  `PLAN_IMPORT_IP_LIMIT=1000` in `supabase/functions/.env` locally first.

## Google Sign-In

The app uses Google's native sign-in (`@react-native-google-signin/google-signin`) and exchanges
the ID token with Supabase (`signInWithIdToken`). Until the client IDs are set, the Google button
says it isn't available yet.

1. **Google Cloud** (APIs & Services): set up the OAuth consent screen (app name, support email;
   scopes `openid`, `email`, `profile`), then create three OAuth client IDs:
   - **Web application**: its client ID is the one the ID token is issued for.
   - **iOS**: bundle ID `app.traqa.mobile`.
   - **Android**: package `app.traqa.mobile` and the SHA-1 of the signing key, one client
     per key (debug keystore for local builds, EAS credentials, Play App Signing).
2. **App:** in `.env`, `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` and `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`.
   `app.config.ts` turns the iOS ID into the URL scheme, so make a new development build.
3. **Supabase (local):** `cp supabase/.env.example supabase/.env`, put the web and iOS client IDs
   in `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` (comma-separated), restart Supabase.
4. **Supabase (production):** Authentication → Providers → Google: enable, the same client IDs,
   "Skip nonce checks" on.

## Sign in with Apple

iOS only (Android and web don't show the button). The app uses Apple's native sheet
(`expo-apple-authentication`) and exchanges the identity token with Supabase; its audience is the
app ID, so no secret is needed.

1. **Apple Developer** (paid membership; a free personal team can't sign this capability): the
   app ID `app.traqa.mobile` needs "Sign in with Apple". Xcode's automatic signing and
   EAS-managed credentials add it from the entitlement the config plugin sets.
2. **Supabase (local):** already on in `config.toml` (`[auth.external.apple]`).
3. **Supabase (production):** Authentication → Providers → Apple: enable, Client IDs
   `app.traqa.mobile`.
4. **Revoking on account deletion** (App Store guideline 5.1.1(v)): deleting an Apple account
   shows Apple's sheet once more; the `revoke-apple-token` Edge Function exchanges that code and
   revokes the tokens. It needs a Sign in with Apple key: Apple Developer → Keys → new key with
   "Sign in with Apple" (primary app ID `app.traqa.mobile`), download the `.p8` (only possible
   once). Put `APPLE_TEAM_ID`, `APPLE_KEY_ID` and `APPLE_PRIVATE_KEY` in
   `supabase/functions/.env` (see the example file); in production set the secrets and deploy
   the function. Without them the deletion still works, only the revocation is skipped.

App IDs in the developer account: `npm run apple:ids` lists them with the App Store record that
uses each one, `npm run apple:ids -- delete <identifier> …` deletes unused ones after asking. It
needs an App Store Connect API key in `.env` (see `.env.example`).

## Purchases (RevenueCat)

On iOS the paywall buys through RevenueCat (`react-native-purchases`) once
`EXPO_PUBLIC_REVENUECAT_IOS_KEY` (the public `appl_…` key) is in `.env`; without it, and on Android
for now, purchases are simulated in development builds only. The RevenueCat app user ID is the
Supabase user ID; purchases made before sign-up move to the account at login.

What the code expects:

- **App Store Connect:** subscription group "Traqa Pro" with `traqa_pro_monthly` (1 month,
  9,99 €) and `traqa_pro_yearly` (1 year, 59,99 €), each with a 1-week free-trial introductory
  offer. The Paid Apps agreement must be active, also for sandbox purchases.
- **RevenueCat:** entitlement `pro` with both products; offering `default` (current) with the
  packages `$rc_monthly` → `traqa_pro_monthly` and `$rc_annual` → `traqa_pro_yearly`.
- **Server check:** with `REVENUECAT_SECRET_KEY` (a v1 secret key, `sk_…`) in
  `supabase/functions/.env`, the body check analysis only runs for accounts with an active `pro`
  entitlement. Without the key, or when RevenueCat can't be reached, it isn't checked.
- **Testing:** a development build on an iPhone, signed in to a sandbox tester under Settings →
  App Store → Sandbox Account.

## Languages

The app language is mirrored to `profiles.language` (for the team) and to the auth user metadata
(`user_metadata.language`). The account emails in `supabase/templates/` (confirmation, password
reset, email change) pick their text from it. `config.toml` applies them locally; for the hosted
project run `supabase config push` or paste them under Auth → Email Templates.
