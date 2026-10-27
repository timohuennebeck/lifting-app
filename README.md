# Loqqa

Workout logger for iOS and Android. Tabs: **Training** (the week, the plan with its routines,
single routines), **Level** (muscle levels 1–100), **Körper** (progress checks: three photos, an
AI score, before and after) and **Profile** (workout history, support, settings). "+" starts a
workout or creates a routine or a plan (imported from photos or a file, or made by the AI). The
scale button in every tab's header opens the weight history. The original design handoff is in
git history (`git show 48b667e:design/README.md`).

## Stack

- **Expo SDK 57** with Expo Router (typed routes), protected routes, native tabs and the React Compiler
- **Supabase** for auth (Sign in with Apple and Google; no email sign-in), Postgres, storage and the Edge Functions (Deno; the plan and progress-check functions call OpenAI)
- **PowerSync** for local-first SQLite sync, read through **TanStack Query** (`@powersync/tanstack-react-query`)
- **Drizzle ORM** (`@powersync/drizzle-driver`) for typed queries; `src/shared/data/powersync/schema.ts` is the client schema
- **Uniwind** (Tailwind v4) with `tailwind-merge` via `cn()`
- **Zustand** + **MMKV** for global and persisted client state
- **i18next** with `en` (source), `de`, `pt-PT`, `pt-BR`, `ko`
- **RevenueCat** for the Pro subscription

## Getting started

```bash
npm install
cp .env.example .env.local      # Loqqa Dev's settings: the local stack

# Supabase (Docker required); generate the ES256 signing key once
npm run supabase:keys           # writes supabase/signing_key.json (gitignored)
npm run supabase:start          # copy the publishable key into .env.local

# Edge Function secrets (OpenAI key for the plan import, plan generation and progress check;
# Apple key for revoking tokens), see the file
cp supabase/functions/.env.example supabase/functions/.env

# PowerSync service, joined to the Supabase docker network
npm run powersync:up

# Native modules (MMKV, op-sqlite) need a development build, not Expo Go
npm run ios   # or npm run android; installs Loqqa Dev
```

## Loqqa Dev and production builds

`app.config.ts` makes two apps that install side by side, each with its own data:

- **Loqqa Dev** (`npm run ios`, the default): bundle ID `app.loqqa.mobile.dev`, links
  `loqqa-dev://`, widgets `app.loqqa.mobile.dev.widgets` with the app group
  `group.app.loqqa.mobile.dev`. Its settings come from `.env.local` (Expo loads it for
  every build on your computer), so it works with the local stack.
- **Loqqa** (`APP_VARIANT=production`, the `production` profile in `eas.json`): bundle ID
  `app.loqqa.mobile`, links `loqqa://`. `npm run build:ios` builds it on EAS with a new build number
  and submits it to TestFlight.
- **Production settings** live in EAS's `production` environment (the EAS dashboard, or
  `eas env:create --environment production`): `EXPO_PUBLIC_SUPABASE_URL`,
  `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `EXPO_PUBLIC_POWERSYNC_URL`,
  `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_POSTHOG_KEY`, and for iOS
  `EXPO_PUBLIC_REVENUECAT_IOS_KEY` and `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`; `EXPO_PUBLIC_POSTHOG_HOST`
  only to leave PostHog's EU cloud.
  EAS builds from what git tracks, so `.env.local` never goes in. A production build fails when Supabase
  or PowerSync is a local address, and on EAS when one of those values (all but the host) is
  missing.
- **Accounts for Loqqa Dev:** the first signed build registers its App ID, with Sign in with Apple
  and the app group (automatic signing); it needs no App Store Connect app. Sign in with Apple
  works with the local Supabase (`config.toml` takes both app IDs); Google sign-in needs an iOS
  OAuth client of its own (see Google Sign-In); purchases stay simulated (no RevenueCat key in
  `.env.local`).

## Project structure

```
src/
  app/                 Expo Router routes only (thin files re-exporting feature screens)
  features/<feature>/  components, screens, data, hooks, lib, stores per feature
  shared/              ui primitives, app-level components, data layer, hooks, i18n, lib, stores
supabase/              config, migrations (RLS, PowerSync publication), Edge Functions
powersync/             self-hosted service config, sync streams, docker compose
scripts/               React Compiler check, plan import and generation tests, muscle artwork, Apple IDs,
                       legal texts migration
locales/               iOS permission texts per language (app.json `locales`)
plugins/               local config plugins: the iOS "Log weight" App Shortcut (Swift, its texts)
docs/legal/            the legal texts per language and what is still open about them
```

AI agents: see `AGENTS.md`.

## Scripts

- `npm run typecheck` (regenerates Uniwind's types first), `npm run lint`, `npm run format` /
  `npm run format:check`
- `npm run compiler:check`: lists components and hooks the React Compiler skips (ESLint's compiler
  rules catch most of these, not all)
- `npm run supabase:keys`, `supabase:start`, `supabase:stop`, `supabase:reset`;
  `npm run powersync:up`, `powersync:down`
- `npm run plan:eval` and `npm run plan:generate-eval`: plan import and plan generation tests (see
  below)
- `npm run apple:ids`: App IDs in the Apple developer account (see Sign in with Apple)
- `node scripts/generate-muscle-paths.mjs`: rebuilds `src/shared/ui/muscle-map/body-paths.ts` from
  `scripts/muscle-art`

## Support tickets (team side)

Users write `tickets` and `ticket_messages` from the app. The team works with the service role:

- **Reply:** insert into `ticket_messages` with `author = 'team'`, the ticket owner's `user_id` and the
  text in `content` (up to 5,000 characters), written in the owner's `profiles.language`. Screenshots in
  `attachments` must lie under `<user_id>/<ticket_id>/` in the `ticket-attachments` bucket (at most 5).
- **Change status:** insert into `ticket_events` with `kind = 'status'` and the new `status`. A trigger mirrors it
  onto `tickets.status`. Optional: `version` (e.g. `'1.4.3'`), which the app shows translated ("Erscheint mit
  Update 1.4.3" / "Coming in update 1.4.3"), or `note` for custom text, shown as written (not translated).
- Users can only reopen (logged as `kind = 'reopened'`); messages are append-only.

## Exercise catalog (team side)

Exercises live in `public.exercises`. Every install reads them, also logged out, and the app pulls
changes hourly, so new exercises ship without a release. Edit them with the service role.

- **`id`:** a slug such as `bench-press`. Workouts store it, so never rename or delete an exercise; set
  `is_active = false` to hide it from the picker while history keeps its name.
- **`name` / `instructions`:** per language (`en`, `de`, `pt-PT`, `pt-BR`, `ko`); English is required
  and the fallback. Instructions are a list of `{ "title", "text" }` steps.
- **`equipment`:** what the app shows with the exercise ("Langhantel · Brust"), an id in
  `public.equipment`.
- **`needs`:** what the user must have for it, as a list of lists of equipment ids: every inner
  list needs one of its items. `[["barbell"], ["rack"], ["bench"]]` is a bench press,
  `[["dumbbell", "kettlebell"]]` a goblet squat, `[]` needs nothing (push-ups, lunges). The plan
  generation only offers exercises whose needs the user's equipment meets.
- **`muscles`:** body map regions and their share of the work, e.g.
  `{"chest": 0.6, "triceps": 0.25, "front_delts": 0.15}`.
- **`measures`:** what one set records, and so which boxes the workout screen shows:
  `{weight,reps}` (kg × reps, also bodyweight moves with added weight), `{reps}` (push-ups),
  `{seconds}` (planks) or `{weight,seconds}` (weighted holds).
- **`image_path`:** a file in the public `exercise-media` bucket.
- **Equipment (`public.equipment`):** one row per piece of equipment with its `name` per language
  (English required), `in_gym` (a full gym has it: "Komplettes Studio" includes it), `at_home`
  (offered in the "Eigene Geräte" checklist) and `position` (its order there). `bodyweight` only
  labels exercises without equipment and can't be a need. Never delete a row; set
  `is_active = false`. New equipment is a row plus the needs of the exercises that use it.
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
  (else English, else `pt-BR`), linked from sign-up, the paywall and Settings.
  Write the text as Markdown: headings, paragraphs, `>` quotes, lists, `**bold**` and
  `[links](https://…)`.
- **Publishing:** the texts live in `docs/legal/<locale>/` (German is binding; `en`, `pt-PT`,
  `pt-BR` and `ko` are translations). `node scripts/legal-migration.mjs <version> <date> <name>`
  turns them into a migration with one row per kind and locale, which `supabase db push` publishes.
  Locales after the name publish only those, e.g. a translation added to a version already out.
  `docs/legal/OPEN-QUESTIONS.md` lists what is still open.

## Weight tracking

- **`weight_entries`:** one row per user and calendar day: `date` (the user's own day, no time
  zone) and `weight_kg` (always kg, two decimals). The id comes from user and date
  (`private.weight_entry_id`, in the app `weightEntryId`: the first 32 hex digits of SHA-256 of
  `<user id>:<date>`), so two devices saving the same day write one row and the last save wins.
- **In the app:** the scale button in the tab header opens the history; its "+" adds today's
  weigh-in, and its calendar (oldest month on top, loading more months both ways) opens any day.
  The trend is computed on the device: each weigh-in moves it 10 % toward the scale value. The
  onboarding weight becomes the first entry; bodyweight exercise scores and the progress check
  assessment use the latest one.

## Progress check assessment

The app uploads the three photos (front, side, back) to the private `progress-photos` bucket and
calls the `assess-progress` Edge Function, which sends them to OpenAI (`gpt-6.1-sol` by default, via
the standard API at `api.openai.com`) and returns the check's values, or the photos to retake.

- **Secrets:** `supabase/functions/.env` locally (loaded by `supabase start`); in production
  `npx supabase secrets set`, e.g. with `--env-file` from a copy of that file without
  `APPLE_CLIENT_ID` (that one is Loqqa Dev's). `OPENAI_API_KEY` is an OpenAI API key;
  `OPENAI_MODEL` overrides the default model.
- **Rules (server-side):** adults only (18+ by the profile's birth date), at most 5 assessments per user in 24 hours.
- **`progress_check_runs`:** one row per assessment (a run of the function), server-only. Saving a
  check (`progress_checks`, with its photos in `progress_check_photos`) takes its score, values and
  time from the run; a check without one is rejected.

## Plan import

Users can import their plan from photos or a file (PDF, Excel, CSV, text) instead of having one
made: in onboarding, and in the app from "+" or Training (the same screens, routed under
`src/app/(onboarding)/import/` and `src/app/(app)/plan/import/`). The app shrinks photos to JPEGs
and calls the `read-plan` Edge Function, which sends them to OpenAI together with the exercise
catalog and returns the plan in the app's shape: each line matched to a catalog exercise, or a new
exercise the app creates for the user with the plan. Lines it isn't sure about come with
alternatives for the user to review.

- **Streaming:** the function passes each exercise on as soon as the model has written it, as
  server-sent events (`PlanEvent` in `supabase/functions/_shared/plan-events.ts`); the app reads
  them with `expo/fetch`. The
  review opens with the first exercise and fills in routine by routine; "Plan übernehmen" waits for the
  whole plan. Leaving the review stops the model. Limits and bad requests still answer with an
  HTTP status before the stream starts.
- **Secrets:** the same `OPENAI_API_KEY` and `OPENAI_MODEL` as the progress check.
- **Speed:** the import runs on OpenAI's Fast mode (`service_tier: "fast"`), up to 2.5× faster
  output at twice the token price. `PLAN_IMPORT_FAST=false` turns it off. OpenAI may serve a
  request at standard speed when it is busy; the function log shows the tier it got.
- **Rules (server-side):** it also runs before there is an account, so imports are limited per network
  (`PLAN_IMPORT_IP_LIMIT`, default 10) and in total (`PLAN_IMPORT_DAILY_LIMIT`, default 1,000) per
  24 hours. `plan_requests` keeps a keyed hash of the IP, never the IP itself.
- **Testing:** `npm run plan:eval` sends the 19 test plans in `scripts/plan-import-eval/fixtures`
  (typed, spreadsheet, handwritten, whiteboard, screenshot, spoken; German, English, Portuguese,
  Korean) to the functions and scores what it read against `cases.json`, with the time to the first exercise and
  to the whole plan. `npm run plan:eval -- --dir <folder>` reads your own photos and files and
  prints what it found. One run is 15 imports (the 4 spoken cases go to read-exercises), so set
  `PLAN_IMPORT_IP_LIMIT=1000` in `supabase/functions/.env` locally first.

## Voice input

Wherever exercises are edited (a plan in the plan flow, including "Selbst erstellen", a routine,
the workout builder), a microphone next to "+" opens the voice input (`src/features/voice-input/`):
the user names exercises with sets and reps, e.g. „Hack Squat drei mal fünfzehn", and they are
added to the workout shown.

- **Speech to text** runs on the phone with `expo-speech-recognition` (Apple's or Google's
  recognition, in the app language). The text shows as it is heard and can be corrected by hand;
  each tap on the microphone adds to it. The microphone and speech recognition permissions are
  asked on the first tap. Needs a development build with the module.
- **Matching:** the `read-exercises` Edge Function gets the text (at most 4,000 characters) with
  the app language and answers the exercises with their sets at once (not streamed). It reads each
  exercise exactly as `read-plan` reads a plan's line (`_shared/exercise-reading.ts`: the rules,
  the catalog, the answer shape, the clean-up), plus rules for speech: numbers as words (Korean
  names the reps first), misheard names, corrections.
- **Adding:** in a plan being set up and in the workout builder, unsure matches show "Gehört
  als …" to confirm or swap, and exercises the catalog lacks are created with the plan or when the
  workout starts (only those still in it). A saved routine takes them at once, best match first.
- **Rules (server-side):** limited on their own (`plan_requests` kind `voice`):
  `PLAN_VOICE_IP_LIMIT` (default 60) per network and `PLAN_VOICE_DAILY_LIMIT` (default 5,000) in
  total per 24 hours; Fast mode as the plan import (`PLAN_VOICE_FAST=false` turns it off).

## Plans, routines and workout entries

What the user trains from, and what they logged:

- **`plans`:** a plan holds routines in order (`routines.position`). `sessions_per_week` of its
  workouts make one plan week, on whichever days; a week ends when it has that many, however long
  it took. The plan Training follows is `profiles.active_plan_id`, else the first plan.
- **`routines`** (with `routine_exercises` and `routine_sets`): in a plan (`plan_id`) or among the
  single routines, "Einzeltrainings" (`plan_id` null), e.g. for a hotel gym. Copying one between
  the two makes a copy.
- **`workout_entries`** (with `workout_entries_exercises` and `workout_entries_sets`): logged or
  running workouts. One started from a plan's routine gets `plan_id` and `plan_week`, the week the
  plan is in then; free workouts and single routines have neither and don't count.
- **Blocks (optional):** `block_weeks` is the length of a block with its deload, null for none;
  blocks repeat from week 1 (`block_start_week`, always 1). Each week after a block's first takes
  one rep off every set's saved RIR (never below 0); the deload keeps the first half of the sets
  (rounded up) at RIR 4. Sets without RIR keep none. AI plans run in blocks of 4 + 1 weeks;
  imported plans without blocks, with a weekly goal of their routine count.

## Plan generation

"Erstell mir einen Plan" (in onboarding, and in the app from "+" or Training) sends the flow's answers to the
`generate-plan` Edge Function: goal, focus muscles, equipment, workouts a week, split, session
length and experience; no name, no body data. The function gives OpenAI the catalog exercises the equipment
allows, and the model writes the plan in a fixed shape (exercise ids from that list only). The
plan streams to the app like an import and opens in the same editor; the name step comes after.
There is no plan made on the device: without a connection, past the limit or when the model fails,
the app says so and the user goes back a step.

- **Equipment:** the model only sees the exercises the user can do: "Komplettes Studio" has every
  item a gym has (`in_gym`), "Eigene Geräte" the ticked ones (`profiles.home_equipment`), "Keine
  Geräte" none, and an exercise fits when each of its `needs` is met (see Exercise catalog).
- **Split:** asked after the workouts a week (2–6): "Keine Präferenz", picked by default, leaves
  it to the model; then only the splits that suit that many (`splitsFor` in
  `src/features/plan-create/lib/splits.ts`, the recommended one first). Kept in `profiles.split`
  (null for no preference) for the next plan.
- **Exercises left out:** cardio and timed holds (planks, wall sits). Core work (abs and obliques
  at least half the stimulus) only for hypertrophy, or with abs or obliques as a focus: for
  strength the main lifts already train the trunk.

- **Checked server-side** (`planBuilder` in `generate.ts`), as the plan streams: one routine per
  workout a week, in the order they are done, no exercise twice in a routine, at most 10 a
  routine, each within the session length (the app's estimate, plus 10 %), sets 1–6, reps 1–30,
  RIR 0–4 (the first week of a block), rest 30–300 s.
- **Secrets and speed:** as the plan import; `PLAN_GENERATE_FAST=false` turns Fast mode off.
- **Rules (server-side):** limited on their own, like imports: per network
  (`PLAN_GENERATE_IP_LIMIT`, default 10) and in total (`PLAN_GENERATE_DAILY_LIMIT`, default 1,000)
  per 24 hours, in `plan_requests` with `kind = 'generate'`.
- **Testing:** `npm run plan:generate-eval` asks for 18 plans (goals, equipment, 2–6 workouts a
  week, every split, 20–120 minutes, every experience level, with and without focus; German, English,
  Portuguese) and checks each: routines, time, equipment, repeats, every major muscle group trained, push/pull
  balance, focus volume, reps for the goal, core work, limits for beginners. The checks are rules of thumb;
  the report in `scripts/plan-generate-eval/out/` has every plan to read. Set
  `PLAN_GENERATE_IP_LIMIT=1000` in `supabase/functions/.env` locally first.
- **Prompt changes:** the model answers differently each time, so test a change with
  `npm run plan:generate-eval -- --repeat 3` before and after it, then
  `npm run plan:generate-compare`: how often each check passed in the last two runs, overall and
  per profile.

## Google Sign-In

The app uses Google's native sign-in (`@react-native-google-signin/google-signin`) and exchanges
the ID token with Supabase (`signInWithIdToken`). Until the client IDs are set, the Google button
says it isn't available yet.

1. **Google Cloud** (APIs & Services): set up the OAuth consent screen (app name, support email;
   scopes `openid`, `email`, `profile`), then create three OAuth client IDs:
   - **Web application**: its client ID is the one the ID token is issued for.
   - **iOS**: bundle ID `app.loqqa.mobile`, and one more for Loqqa Dev, `app.loqqa.mobile.dev`.
   - **Android**: package `app.loqqa.mobile` and the SHA-1 of the signing key, one client
     per key (debug keystore for local builds, EAS credentials, Play App Signing).
2. **App:** `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` and `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`, in
   `.env.local` with Loqqa Dev's iOS client and in EAS's production environment with the app's.
   `app.config.ts` turns the iOS ID into the URL scheme, so make a new development build.
3. **Supabase (local):** `cp supabase/.env.example supabase/.env`, put the web and Loqqa Dev's iOS
   client IDs in `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` (comma-separated), restart Supabase.
4. **Supabase (production):** Authentication → Providers → Google: enable, the same client IDs,
   "Skip nonce checks" on.

## Sign in with Apple

iOS only (Android and web don't show the button). The app uses Apple's native sheet
(`expo-apple-authentication`) and exchanges the identity token with Supabase; its audience is the
app ID, so no secret is needed.

1. **Apple Developer** (paid membership; a free personal team can't sign this capability): the
   app ID `app.loqqa.mobile` needs "Sign in with Apple". Xcode's automatic signing and
   EAS-managed credentials add it from the entitlement the config plugin sets.
2. **Supabase (local):** already on in `config.toml` (`[auth.external.apple]`).
3. **Supabase (production):** Authentication → Providers → Apple: enable, Client IDs
   `app.loqqa.mobile`.
4. **Revoking on account deletion** (App Store guideline 5.1.1(v)): deleting an Apple account
   shows Apple's sheet once more; the `revoke-apple-token` Edge Function exchanges that code and
   revokes the tokens. It needs a Sign in with Apple key: Apple Developer → Keys → new key with
   "Sign in with Apple" (primary app ID `app.loqqa.mobile`), download the `.p8` (only possible
   once). Put `APPLE_TEAM_ID`, `APPLE_KEY_ID` and `APPLE_PRIVATE_KEY` in
   `supabase/functions/.env` (see the example file); in production set the secrets and deploy
   the function. Without them the deletion still works, only the revocation is skipped.

App IDs in the developer account: `npm run apple:ids` lists them with the App Store record that
uses each one, `npm run apple:ids -- delete <identifier> …` deletes unused ones after asking. It
needs an App Store Connect API key in `.env.local` (see `.env.example`).

## Purchases (RevenueCat)

On iOS the paywall buys through RevenueCat (`react-native-purchases`) once
`EXPO_PUBLIC_REVENUECAT_IOS_KEY` (the public `appl_…` key) is set (EAS's production environment
for TestFlight and the App Store); without it, as in Loqqa Dev, and on Android for now, purchases
are simulated in development builds only. The RevenueCat app user ID is the
Supabase user ID; purchases made before sign-up move to the account at login.

What the code expects:

- **App Store Connect:** subscription group "Loqqa Pro" with `loqqa_pro_monthly` (1 month,
  9,99 €) and `loqqa_pro_yearly` (1 year, 59,99 €), each with a 1-week free-trial introductory
  offer. The Paid Apps agreement must be active, also for sandbox purchases.
- **RevenueCat:** entitlement `pro` with both products; offering `default` (current) with the
  packages `$rc_monthly` → `loqqa_pro_monthly` and `$rc_annual` → `loqqa_pro_yearly`.
- **Server check:** with `REVENUECAT_SECRET_KEY` (a v1 secret key, `sk_…`) in
  `supabase/functions/.env`, the progress check assessment only runs for accounts with an active `pro`
  entitlement. Without the key, or when RevenueCat can't be reached, it isn't checked.
- **Testing:** a development build on an iPhone, signed in to a sandbox tester under Settings →
  App Store → Sandbox Account.

## Analytics (PostHog)

Product analytics and error tracking go to PostHog's EU cloud once `EXPO_PUBLIC_POSTHOG_KEY` (the
public `phc_…` project key) is set (`.env.local`, EAS for production); without it nothing
is sent. The events and their
properties are typed in `src/shared/lib/posthog.ts` (`AnalyticsEvents`), named
`category:object_action`:

- **Onboarding and plans:** `onboarding:flow_start`, `plan:generate_complete` / `_fail`,
  `plan_import:read_complete` / `_fail`.
- **Money:** `paywall:view` (with `placement`), `paywall:purchase_complete` / `_fail`,
  `paywall:restore_complete`.
- **Account:** `account:sign_up_complete` / `_fail` (with the reason) for new accounts,
  `account:sign_in_complete` for returning ones (with whether onboarding was finished). The
  PostHog id is the Supabase user id from sign-up or sign-in (`identify`), so the anonymous
  onboarding and purchase events join the person, and `reset` on sign-out.
- **Training:** `workout:start`, `workout:finish`, `workout:discard`, with the plan week, sets and
  records from the local database.
- **Automatic:** a `$screen` per route (`/workout/[id]`, ids left out), uncaught errors and
  unhandled rejections as `$exception`, app lifecycle events.

Person properties are the profile's answers, the plan's workouts per week, an age band and Pro.
Body weight, height, progress photos and their scores, names, email, the birth date and free text
are never sent. `posthog-react-native` uses `expo-application` and `expo-device`: a new
development build is needed after pulling.

## Languages

`en` (source), `de`, `pt-PT`, `pt-BR` and `ko`. App texts are in
`src/shared/i18n/locales/<language>/<namespace>.json` (every language has the same keys), the iOS
permission texts in `locales/`, and exercise and equipment names in the catalog rows. Legal
documents are per language too, in all five.

The app language is mirrored to `profiles.language` (for the team).
