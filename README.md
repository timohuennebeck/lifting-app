# Loqqa

Workout logger for iOS and Android. Tabs: **Training** (the week, the plan with its routines,
single routines; its "Kai · KI-Coach" card opens the AI coach), **Sätze** (sets per muscle in
the last 7 to 90 days), **Körper** (progress checks: three photos, an AI score, before and after) and **Profile** (workout
history, support, settings). "+" starts a workout or creates a routine or a plan (imported from
another app's export or a spreadsheet, made by the AI, or built by hand). The scale button in every tab's header opens the weight
history. The original design handoff is in git history (`git show 48b667e:design/README.md`).

## Stack

- **Expo SDK 57** with Expo Router (typed routes), protected routes, native tabs and the React Compiler
- **Supabase** for auth (Sign in with Apple and Google, or email and password), Postgres, storage and the Edge Functions (Deno; the plan, progress-check and coach functions call OpenAI)
- **PowerSync** for local-first SQLite sync, read through **TanStack Query** (`@powersync/tanstack-react-query`)
- **Drizzle ORM** (`@powersync/drizzle-driver`) for typed queries; `src/shared/data/powersync/schema.ts` is the client schema
- **Uniwind** (Tailwind v4) with `tailwind-merge` via `cn()`
- **Zustand** + **MMKV** for global and persisted client state
- **i18next** with `en` (source), `de`, `pt-PT`, `pt-BR`, `ko`, `es`, `fr`
- **RevenueCat** for the Pro subscription

## Getting started

```bash
npm install
npm run env:pull                # Loqqa Dev's settings from EAS (or: cp .env.example .env.local)

# Supabase (Docker required); generate the ES256 signing key once
npm run supabase:keys           # writes supabase/signing_key.json (gitignored)
npm run supabase:start          # copy the publishable key into .env.local

# Edge Function secrets (OpenAI key for the plan import, plan generation, progress check and coach;
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
- **Loqqa Dev's settings** are kept in EAS's `development` environment too: `npm run env:pull`
  writes them into `.env.local`, replacing the file, so redo local changes after it (your Mac's
  Wi-Fi IP instead of `127.0.0.1` for a phone). The App Store Connect key's `ASC_KEY_ID`,
  `ASC_ISSUER_ID` (Sensitive) and `ASC_KEY_PATH` (`~/…`) are kept there too; the `.p8` file stays
  on the Mac. Loqqa Dev doesn't build against the production Supabase project, so test data stays
  out of it; `ALLOW_PRODUCTION_BACKEND=true` allows it on purpose.
- **Loqqa** (`APP_VARIANT=production`, the `production` profile in `eas.json`): bundle ID
  `app.loqqa.mobile`, links `loqqa://`. `npm run build:ios` builds it on this Mac with a new build
  number (`eas build --local`, with EAS's settings and signing; needs Xcode, CocoaPods and
  fastlane) and uploads it to TestFlight with `npm run upload:ios` (Xcode's altool, the App Store
  Connect key in `.env.local`), which also retries an upload. `npm run build:ios:cloud` builds
  and submits on EAS instead, behind its free queues.
- **Production settings** live in EAS's `production` environment (the EAS dashboard, or
  `eas env:create --environment production`): `EXPO_PUBLIC_SUPABASE_URL`,
  `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `EXPO_PUBLIC_POWERSYNC_URL`,
  `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_POSTHOG_KEY`, `EXPO_PUBLIC_POSTHOG_HOST`, and
  for iOS `EXPO_PUBLIC_REVENUECAT_IOS_KEY` and `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`.
  EAS builds from what git tracks, so `.env.local` never goes in. A production build fails when Supabase
  or PowerSync is a local address, and on EAS when one of those values is missing.
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
- `npm run i18n:check`: the app languages have the same keys, and each is in `app.json`
- `npm run compiler:check`: lists components and hooks the React Compiler skips (ESLint's compiler
  rules catch most of these, not all)
- `npm run supabase:keys`, `supabase:start`, `supabase:stop`, `supabase:reset`;
  `npm run powersync:up`, `powersync:down`
- `npm run plan:eval` and `npm run plan:generate-eval`: plan import and plan generation tests (see
  below)
- `npm run coach:eval`: tests the coach's answers (see Coach)
- `npm run suggestions:eval`: the live workout's suggestions on simulated lifters (see Set
  suggestions)
- `npm run apple:ids`: App IDs in the Apple developer account (see Sign in with Apple)
- `node scripts/generate-muscle-paths.mjs`: rebuilds `src/shared/ui/muscle-map/body-paths.ts` from
  `scripts/muscle-art`

## Support tickets (team side)

Users write `tickets` and `ticket_messages` from the app; each ticket records the platform, OS version,
device model and app version it came from. The team answers in the support desk
([lifting-app-customer-support](https://github.com/timohuennebeck/lifting-app-customer-support)), signed in as
one account whose `app_metadata.role` is `'support'` (set it with the service role, e.g. in the dashboard's SQL
editor: `update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"support"}' where email = …`;
it takes effect at the next sign-in). That account reads every ticket through the `support_inbox` view and
`support_customers()` and keeps what it has read in `support_ticket_reads`. It and the service role write:

- **Reply:** the desk calls the `send-team-reply` Edge Function, which translates the reply into the owner's
  app language and saves both (see Translations). With the service role, insert into `ticket_messages` with
  `author = 'team'`, the ticket owner's `user_id` and the text in `content` (up to 5,000 characters), in any
  language; it is translated a moment later. Screenshots in `attachments` must lie under
  `<user_id>/<ticket_id>/` in the `ticket-attachments` bucket (at most 5).
- **Change status:** insert into `ticket_events` with `kind = 'status'` and the new `status`: `'open'` (waiting
  for the team) or `'closed'`. A trigger mirrors it onto `tickets.status`. What a change means ("we'll build
  this", "fixed in the next update") goes into a reply, which reaches the user in their language. Optional:
  `note`, shown as written (not translated).
- Users can only reopen (logged as `kind = 'reopened'`); messages are append-only.

### Translations

Every support message is stored once, as written, and shown to each reader in their language, with
"Show original" beside it:

- **A user's message** is translated into the team's language (`SUPPORT_LANGUAGE`, default German) as soon as
  it arrives; the desk asks for other languages when it is switched to one.
- **A team reply** is translated into the user's app language before it is saved (`send-team-reply`), so the
  app never shows it untranslated. The team can write in any language.
- **A switch of the app language** (mirrored to `profiles.language`) has the team's earlier replies translated
  into the new one. Translations are kept, so switching back costs nothing.

How: `ticket_messages.language` holds the detected language, `ticket_message_translations` one row per message
and language (synced to the user with their messages; only the Edge Functions write it). Triggers call the
`translate-ticket-messages` function through pg_net for every new message and for language switches. The model
is OpenAI's GPT-6 Luna (`OPENAI_TRANSLATION_MODEL`), about $0.0002 per message; each call logs its tokens as
`ticket_translation`. Without the setup below nothing breaks: messages simply show as written.

Setup per Supabase project (locally `supabase/seed.sql` and `supabase/functions/.env.example` cover it):

1. Edge Function secrets: `OPENAI_API_KEY` (already set for the plans) and `TRANSLATION_WEBHOOK_SECRET`, a long
   random string; optionally `SUPPORT_LANGUAGE`. Deploy `translate-ticket-messages` and `send-team-reply`.
2. In the SQL editor, where the database finds the functions and the same secret:

   ```sql
   select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
   select vault.create_secret('<the TRANSLATION_WEBHOOK_SECRET value>', 'translation_webhook_secret');
   ```

Tests for the functions (faked OpenAI and Supabase): `npm run functions:test` (needs Deno).

## Exercise catalog (team side)

Exercises live in `public.exercises`. Every install reads them, also logged out, and the app pulls
changes hourly, so new exercises ship without a release. Edit them with the service role.

- **`id`:** a slug such as `bench-press`. Workouts store it, so never rename or delete an exercise; set
  `is_active = false` to hide it from the picker while history keeps its name.
- **`name` / `instructions`:** per language (`en`, `de`, `pt-PT`, `pt-BR`, `ko`, `es`, `fr`); English is required
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
- **`image_path`:** a photo in the public `exercise-media` bucket, `exercises/<id>-v<n>.webp`
  (1600×1200), with its vertical thumbnail next to it as `exercises/<id>-v<n>-thumb.webp` (240×320).
  Devices keep images they have downloaded until sign-out (on iOS with `plugins/keep-image-cache`;
  the cache otherwise deletes them after a week), so a replaced image gets the next version in its
  name and a new `image_path`; never overwrite a file.
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
  (else English), linked from sign-up, the paywall and Settings.
  Write the text as Markdown: headings, paragraphs, `>` quotes, lists, `**bold**` and
  `[links](https://…)`.
- **Publishing:** the texts live in `docs/legal/<locale>/` (German is binding; `en`, `pt-PT`,
  `pt-BR`, `ko`, `es` and `fr` are translations). `node scripts/legal-migration.mjs <version> <date> <name>`
  turns them into a migration with one row per kind and locale, which `supabase db push` publishes.
  Locales after the name publish only those, e.g. a translation added to a version already out;
  `--kind=terms` or `--kind=privacy` only that document; `--reaccept` sets `requires_reacceptance`.
  The app shows the version with the latest `effective_at` that has passed, so a new version needs a
  later one than the version before, e.g. `'2026-11-05 18:00:00+00'` after one from 12:00 that day.
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

## Plates

- **In the live workout:** typing a weight shows the plates above the number pad for exercises
  loaded with plates (`plateSetup` in `src/features/workout/lib/plates.ts`): every barbell
  exercise, plus a list of catalog ids for special bars (EZ, trap, safety), the Smith machine,
  plate-loaded machines and lifts loaded on one end (landmine, T-bar). The ⓘ opens the plates
  sheet with the weight of the bar, an "Ohne Stange" switch and the plates the gym has (25 to
  1.25 kg, 45 to 2.5 lb, each one turned off and on there). Those are synced on the profile
  (`profiles.plates_kg` / `plates_lb`, JSON lists, null while all are on) and count for every
  exercise; the plates for a weight are taken only from them:
  as many of the heaviest as still let the lighter ones make the rest (with 15s and 10s, 20 kg a
  side is two tens).
- **`exercise_settings`:** one row per user and exercise once they change the bar there: `bar_kg`
  (always kg, two decimals) and `no_bar`. The id comes from user and exercise
  (`private.exercise_setting_id`, in the app `exerciseSettingId`), so two devices write one row.
  Without a row the app starts from the exercise: a barbell 20 kg or 45 lb, an EZ bar 10 kg, a
  trap bar 25 kg, a safety bar 30 kg, machines and one-end lifts without a bar.

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

## Workout import

Users bring their training from another app (Hevy, Strong, …) or any spreadsheet: a CSV, TSV or
Excel/OpenDocument file with their workout history, their plan, or both. It is the plan flow's
first step in onboarding; in the app it opens from "+" › Plan, Training and Settings › Daten ›
Importieren (the same screens, routed under `src/app/(onboarding)/import/` and
`src/app/(app)/plan/import/`; the code is in `src/features/workout-import/`).

1. **On the phone:** the file is read (`lib/read-file.ts`, workbooks in `lib/workbook.ts`). A
   workbook with several sheets asks which to read and recommends those that look like a log or a
   plan (`lib/sheet-summary.ts`).
2. **What is where** (the `read-workout-file` Edge Function, step `categorize`): per sheet, a sample of its rows (the
   first, some spread out and the last, at most 150) and what each column holds
   (`lib/samples.ts`) go to the model. It answers whether the sheet is a history, a plan or both,
   which column is the date, the exercise, the weight and so on, and how dates and weights are
   written. The phone then reads every row with that (`lib/history.ts`, `lib/values.ts`).
3. **Which exercise is which** (step `map`, up to 80 names a request, in parallel) runs side by
   side with the plan's rows going to step `plan` as text. Every name the model isn't sure about is
   checked by the user, one per screen: its likeliest exercise, alternatives, or a new exercise
   under the file's name.
4. **No plan in the file:** where the user has none yet, the routines of the last six weeks of the
   history become the plan (`lib/routines.ts`); routines without a name in the file get one from
   the model (step `name`).
5. **Workouts without a date** get one between their neighbours in the file; the user keeps them
   so or leaves them out.
6. **Saving:** the history goes to the `import_workouts` database function, 100 workouts a call
   (PowerSync would upload it row by row). It skips workouts that start at the same minute as one
   of the account's and marks the records. Nothing is saved before "Importiert": in the app its
   button saves it, and its close cross discards the import. In onboarding it waits in a file
   until the account exists (`useSendPendingHistory`), also for an existing account signed in
   there. The plan opens in the plan editor, like a made one.

- **Secrets and model:** `OPENAI_API_KEY`; the steps `categorize`, `map` and `name` run
  `OPENAI_HISTORY_MODEL` (default `gpt-6-luna`) at `OPENAI_HISTORY_REASONING_EFFORT` (default
  `low`), in Fast mode (`HISTORY_IMPORT_FAST=false` turns it off). Step `plan` runs `OPENAI_MODEL`
  on Fast mode (`PLAN_IMPORT_FAST=false` turns it off) and streams the plan (`PlanEvent` in
  `supabase/functions/_shared/plan-events.ts`).
- **Rules (server-side):** it also runs before there is an account, so each step counts per network
  (`HISTORY_IMPORT_IP_LIMIT`, default 40) and in total (`HISTORY_IMPORT_DAILY_LIMIT`, default
  4,000) per 24 hours (`plan_requests` kind `history`); step `plan` counts on its own
  (`PLAN_IMPORT_IP_LIMIT`, default 10, and `PLAN_IMPORT_DAILY_LIMIT`, default 1,000, kind `import`).
  `plan_requests` keeps a keyed hash of the IP, never the IP itself.
- **Testing:** `scripts/csv-import-lab/samples` holds made-up exports to import (README there).
  `npm run plan:eval` sends the 11 test plans in `scripts/plan-import-eval/fixtures` (spreadsheet
  rows as text, notes, spoken; German, English, Portuguese, Spanish, French, Korean) to the
  functions and scores what they read against `cases.json`, with the time to the first exercise
  and to the whole plan; `npm run plan:eval -- --dir <folder>` reads your own CSV and text files.
  Set `PLAN_IMPORT_IP_LIMIT=1000` in `supabase/functions/.env` locally first.
  `npm run functions:test` runs the checks of `read-workout-file`'s answers.

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
  exercise exactly as `read-workout-file` reads a plan's line (`_shared/exercise-reading.ts`: the rules,
  the catalog, the answer shape, the clean-up), plus rules for speech: numbers as words (French
  counts such as "soixante-dix" too; Korean names the reps first), misheard names, corrections.
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
  blocks repeat from week 1. Each week after a block's first takes one rep off every set's saved
  RIR (never below 0); the deload keeps the first half of the sets (rounded up) at RIR 4. Sets
  without RIR keep none. AI plans run in blocks of 4 + 1 weeks; imported plans without blocks, with
  a weekly goal of their routine count.

## Set suggestions

The live workout's "Vorschlag" column: `src/features/workout/lib/suggestion-rules.ts` for weighted
exercises, `rep-progression.ts` for bodyweight, assisted and timed ones (reps first, then more
added weight or less assistance).

- **Strength:** one estimate per exercise and rep range from the working sets of the last three
  workouts (within 10 % of the heaviest; warm-ups and ramps don't count): an entered RIR plus 0.5
  ("5+" as 6), a miss as 0, else the target. Each set's weight and reps follow at its target RIR,
  about a rep fewer per earlier set (fatigue, learned from the user's sets with known RIR).
- **Between workouts:** straight sets share one weight. It stays while the first set is in the
  range; past the top the lightest heavier weight back in it (the middle of the range when
  clearly too light), below it the heaviest that reaches the bottom. A workout is expected to add
  a rep (a quarter with RIR entered), two (then three) after workouts that only showed "done"
  and no miss. One bad day
  (7 % weaker) is ignored; breaks lower the weight.
- **A miss** is fewer reps than suggested at that weight or heavier, unless 2+ reps in reserve
  were entered. Next time: never heavier than the weight missed at, no more reps than it managed,
  at most one fewer.
- **During the workout:** a set within a rep of its suggestion leaves the plan; otherwise the
  open sets of its range follow from it ("5+": at least 10 % heavier). The first time an exercise
  is done, suggestions start once a set shows something (RIR entered, or reps outside the range).
- **Weight steps:** the equipment's usual one, or a coarser one once suggested weights keep being
  lifted rounded to it (62.5 suggested, 60 or 65 lifted).
- **`suggested_weight_kg`, `suggested_reps`, `suggested_seconds`** on `workout_entries_sets`: what
  the set was suggested when it was first logged, so a miss can be told from a set done as
  suggested.
- **Testing:** `npm run suggestions:eval` runs the rules on simulated lifters (ten kinds, 1,000
  each, 30 workouts) and scores every suggested set against the lifter's true strength (the
  target RIR ±1), next to the best possible without knowing the day's form. Every suggestion is
  checked against hard rules (on the weight step, no more reps than a miss managed, at most
  +25 % or −20 % a workout, …); the script fails when one breaks. Run it after changing the rules.

## Data export

Settings → "Daten" holds "Importieren" (the workout import, see above) and "Exportieren": a
CSV file made on the device, handed to the system's share sheet and removed from the cache afterwards.
It works offline, but waits for the first sync, since the device may not hold the whole history before.

The file has one row per completed set of a finished workout, oldest first; workouts without a
completed set have none. Body weight, plans, progress checks and coach chats aren't in it; the
JSON copy the privacy policy promises under Art. 20 GDPR is separate.

- **Format:** UTF-8 with a byte order mark, commas, decimal points and English headers in every app
  language. Names starting with `=`, `+`, `-` or `@` get a leading `'`, so a spreadsheet doesn't run them.
- **Columns:** `started_at`, `finished_at` (device time zone, with offset), `workout`, `plan`, `plan_week`,
  `exercise_order`, `exercise` (in the app language), `exercise_id`, `set`, `weight_kg` or `weight_lb` (the
  user's unit, as the app shows it), `reps`, `duration_seconds`, `rir`, `is_pr`, `target_min`, `target_max`,
  `target_rir`, `rest_seconds`. Empty means not logged, not 0.

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
  RIR 0–4 (the first week of a block). No rest is stored: the app gives each exercise its own,
  longer for sets of 7 reps or fewer (`restSecondsFor`), and the session length counts with that.
- **Secrets and speed:** as the plan import; `PLAN_GENERATE_FAST=false` turns Fast mode off.
- **Rules (server-side):** limited on their own, like imports: per network
  (`PLAN_GENERATE_IP_LIMIT`, default 10) and in total (`PLAN_GENERATE_DAILY_LIMIT`, default 1,000)
  per 24 hours, in `plan_requests` with `kind = 'generate'`.
- **Testing:** `npm run plan:generate-eval` asks for 20 plans (goals, equipment, 2–6 workouts a
  week, every split, 30–120 minutes, every experience level, with and without focus; German, English,
  Portuguese, Spanish, French) and checks each: routines, time, equipment, repeats, every major muscle group trained, push/pull
  balance, focus volume, reps for the goal, core work, limits for beginners. The checks are rules of thumb;
  the report in `scripts/plan-generate-eval/out/` has every plan to read. Set
  `PLAN_GENERATE_IP_LIMIT=1000` in `supabase/functions/.env` locally first. It imports the rest and
  time rules from `supabase/functions/_shared/`, so it needs Node 22.18 or newer.
- **Prompt changes:** the model answers differently each time, so test a change with
  `npm run plan:generate-eval -- --repeat 3` before and after it, then
  `npm run plan:generate-compare`: how often each check passed in the last two runs, overall and
  per profile.

## Coach

The coach answers questions about the user's own training ("Wie hat sich mein Gewicht entwickelt?",
"Welche Muskeln trainiere ich zu wenig?") in a few sentences, mostly with a chart, and builds a
workout when asked ("Bau mir ein Push-Training"). The app sends the
question to the `coach-chat` Edge Function, where the model picks one of the coach's tools; the tool
computes the numbers from the user's data, and the model writes the answer from them, working out
what the question needs on top (a percentage, when a target is reached). It also swaps exercises in
the user's plan ("Mein Knie zwickt bei Kniebeugen"). The answer and its chart
stream to the app as server-sent events; once complete, the question and answer are
saved and sync to the app; the app shows the streamed answer until the saved one has synced
(`src/features/coach/stores/coach-store.ts`). The screens follow the design "Coach Screens" and open
over the tabs from the Training tab's card, which a flash runs across.

- **Tools** (`supabase/functions/_shared/coach/tools.ts`): `trend`, `compare`,
  `period_vs_average`, `calendar` and `distribution` each draw a chart; `workouts` looks sessions
  up; `find_exercises` and `create_workout` build a workout, which comes as a card in the chart's
  place. The card saves it to the library the first time it opens, under its answer's id, so
  until then nothing piles up there. `show_workout` shows a workout the user saved on the same
  card ("Was ist mein nächstes Training?"), the next one found as on the Training tab; it opens
  that routine. `swap_exercises` shows a plan change on such a card ("Planänderung"): per exercise
  1 to 3 options logging the same (reps or seconds), which the user picks from (or keeps the exercise) before applying them
  in the plan's workouts that have the exercise; sets, targets and rest stay. Nothing changes until
  they tap Übernehmen; the card reads its state from the plan, so it then shows what is in the plan
  with Rückgängig, or that the plan changed since. The context lists each plan workout's exercises
  for it. The values follow the app: the 1RM by Epley, bodyweight exercises with the latest body
  weight, sets per muscle with main muscles counting fully and helpers half, against 10 a week.
- **Rules (server-side):** 16+ by the profile's birth date; consent: a new profile sets
  `profiles.coach_consent_at`, so signing up agrees to the training and body data going to OpenAI;
  asking is the consent too, so the function records it for an account without one (after a
  withdrawal) before anything is sent; Pro, as for
  the progress check; at most 20 questions in 24 hours and 150 in 30 days (`COACH_DAILY_LIMIT`,
  `COACH_MONTHLY_LIMIT`).
- **Secrets:** `OPENAI_API_KEY` as for the plans; `OPENAI_COACH_MODEL` (default `gpt-6.1-sol`) and
  `OPENAI_COACH_REASONING_EFFORT` (default `low`). It runs in Fast mode; `COACH_FAST=false` turns
  that off.
- **Voice input:** the microphone in the field, here and in the support chat, records the question
  or message (expo-audio, mono AAC) and the `coach-transcribe` Edge Function has OpenAI write it
  down (`OPENAI_TRANSCRIBE_MODEL`, default `gpt-transcribe`), with the topic and its terms as
  context; the text goes into the field to be edited. Same rules as the questions (16+, Pro), at
  most 100 a user and 20,000 in total per 24 hours (`COACH_TRANSCRIBE_USER_LIMIT`,
  `COACH_TRANSCRIBE_DAILY_LIMIT`, as `plan_requests` of kind `transcribe`). The recording is
  deleted on the phone once written down and never stored.
- **Test data:** `scripts/seed-coach-data.sql` fills a local account with 34 weeks of Push, Pull
  and Beine (today's Push included), half a year of weigh-ins and four body checks. Run it in the
  database container; again, it replaces what it added:
  `docker exec -i supabase_db_loqqa psql -U postgres -v email=you@example.com < scripts/seed-coach-data.sql`
- **Tables:** `coach_chats` and `coach_messages` (an answer keeps its chart as it was) are written
  only by the function and synced; users read them and delete chats. `coach_runs` is server-only:
  one row per question, which the limits count, with the tool calls (replayed for follow-up
  questions) and the tokens it took. Deleting a chat deletes its tool calls; the rest of the run
  stays for the limits. Chats are kept until the user deletes them or the account.
- **Testing:** `npm run coach:eval` (needs Deno and `OPENAI_API_KEY`) asks 54 questions about two
  made-up users (`supabase/functions/_shared/coach/eval/`) and checks each answer: the tool and
  its arguments, only numbers the tools gave (unless the question needs them worked out), the
  question's language, at most 3 sentences and 50 words, and asking back only when the question
  is unclear. `-- --fast` uses Fast mode,
  `-- --model gpt-6-luna --effort medium` tries others; the answers go to `eval/out/`. Run it
  before and after changing the prompt or a tool.

## Auth emails

Email sign-up sends at most two emails: the 6-digit code for a new password ("Forgot password?")
and, while "Confirm email" is on, the link that confirms a new account. In production Supabase
Auth hands both to the `send-email` Edge Function (a Send Email hook), which writes them in the
user's app language (`profiles.language`, else the language the app sent at sign-up, else
English) and sends them through Resend from `mail.useloqqa.com`. Other email types are refused.
Locally the hook is off and the local mail catcher shows `supabase/templates/recovery.html`.

Setup per production project:

1. **Resend:** verify the sending domain (its DNS records), then create an API key with sending
   access for that domain.
2. **Supabase:** Authentication → Hooks → add a Send Email hook of type HTTPS, URL
   `https://<project-ref>.supabase.co/functions/v1/send-email`, and generate its secret.
3. **Secrets:** `npx supabase secrets set RESEND_API_KEY=… SEND_EMAIL_HOOK_SECRET='v1,whsec_…'`
   (optionally `EMAIL_FROM`), then `npx supabase functions deploy send-email`.
4. **Settings:** Authentication → Sign In / Providers → Email: email OTP length 6 and expiry
   3600 s (the emails say one hour). Raise Authentication → Rate Limits → emails per hour.

Turning the hook off falls back to Supabase's own sending (the custom SMTP settings and the
dashboard's templates).

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
  `supabase/functions/.env` (in production, the project's secrets), the progress check
  assessment, the coach and its voice input (`assess-progress`, `coach-chat`,
  `coach-transcribe`) only run for accounts with an active `pro` entitlement. When RevenueCat
  can't be reached, it isn't checked. Without the key the functions log an error and refuse
  everyone, except on the local stack (`SUPABASE_URL` on `kong`, `localhost` or `127.0.0.1`),
  where everyone counts as Pro. Production needs the key.
- **Testing:** a development build on an iPhone, signed in to a sandbox tester under Settings →
  App Store → Sandbox Account.

## Analytics (PostHog)

Product analytics and error tracking go to PostHog's EU cloud once `EXPO_PUBLIC_POSTHOG_KEY` (the
public `phc_…` project key) is set (`.env.local`, EAS for production); without it nothing
is sent. The events and their
properties are typed in `src/shared/lib/posthog.ts` (`AnalyticsEvents`), named
`category:object_action`:

- **Onboarding and plans:** `onboarding:flow_start` and `onboarding:flow_complete` (a new
  account's onboarding done, with whether the progress check was started, or `skipped` when the
  close cross on the shortcut step jumped past it), `plan:generate_complete`
  / `_fail`, `plan_import:read_complete` / `_fail`, `workout_import:read_complete` / `_fail`
  (counts and times, never names or values), `workout_import:save_complete`, and
  `plan:save_complete` when a new plan is taken, with its `source` (`generated`, `file`,
  `history` or `own`).
- **Money:** `paywall:view` (with `placement`), `paywall:purchase_complete` / `_fail`,
  `paywall:restore_complete`.
- **Account:** `account:sign_up_complete` / `_fail` (with the reason) for new accounts,
  `account:sign_in_complete` for returning ones (with whether onboarding was finished). The
  PostHog id is the Supabase user id from sign-up or sign-in (`identify`), so the anonymous
  onboarding and purchase events join the person, and `reset` on sign-out.
  `account:delete_complete` when an account is deleted.
- **Training:** `workout:start`, `workout:finish`, `workout:discard`, with the plan week, sets and
  records from the local database.
- **Features:** `coach:question_submit` and `coach:answer_complete` / `_fail` (never the text),
  `progress_check:assess_complete` / `_retake` / `_fail` (never the photos or scores),
  `weight:entry_save` (never the weight), `voice:add_complete` / `_fail` (with what it adds to).
- **Plan failures** carry `error_detail` besides `error_code`: where it broke, e.g.
  `http_429_limit`, `stream_incomplete` or `client_TypeError`.
- **Subscriptions** come from RevenueCat's PostHog integration (trial started and converted,
  renewals, cancellations, with revenue; named in the RevenueCat dashboard, e.g.
  `subscription:renew`). The app sets RevenueCat's `$posthogUserId`
  to the PostHog id before a purchase and after sign-in, so these land on the same person; the
  integration itself is switched on in the RevenueCat dashboard.
- **Automatic:** a `$screen` per route (`/workout/[id]`, ids left out), uncaught errors and
  unhandled rejections as `$exception`, app lifecycle events.

Person properties are the profile's answers, the plan's workouts per week, an age band and Pro.
Body weight, height, progress photos and their scores, names, email, the birth date and free text
are never sent. `posthog-react-native` uses `expo-application` and `expo-device`: a new
development build is needed after pulling.

## Languages

`en` (source), `de`, `pt-PT`, `pt-BR`, `ko`, `es` and `fr`. App texts are in
`src/shared/i18n/locales/<language>/<namespace>.json` (every language has the same keys), the iOS
permission texts in `locales/`, and exercise and equipment names in the catalog rows. Legal
documents are per language too, in all seven.

The app language is mirrored to `profiles.language` (for the team).
