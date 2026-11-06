# CSV Import Lab

A throwaway test page for the CSV import MVP: how fast and how well a model sorts a CSV into a
training plan, a workout history or both, and how long the whole import takes (exercise mapping to
the catalog, history, plan). Not part of the app.

Open `index.html` in a desktop browser (double-click it, or `npx serve scripts/csv-import-lab`). No
build and no server: it calls the OpenAI Responses API directly from the browser.

1. **Setup:** OpenAI key, model (default `gpt-6-luna`), reasoning effort. Load the exercise catalog
   from Supabase (URL and publishable key from `.env.local`), or from a JSON file
   (`[{ "id", "name": { "en", "de" }, "equipment", "measures" }]`). Tick **Mock model** to try the
   flow without a key: fake answers, fake latency.
2. **CSV file:** drop one in. Comma, semicolon and tab separators are detected.
3. **Categorise:** one call with the header, exact per-column stats and about 70 sample rows. It
   answers plan / history / both, which column is which, and the lines for the "found data" screen.
   This is the wait before that screen.
4. **Full import:** history and plan run side by side, every call shown on a timeline.
   - History: parsed in code from the columns of step 3 (no model), or the model reads every row in
     chunks. Compare the two modes.
   - Exercise mapping: the distinct exercise names, in batches, against the catalog (same rules as
     `supabase/functions/_shared/exercise-reading.ts`).
   - Plan: the plan rows with the catalog, as `read-plan` does.
5. **Results:** mapping table, workouts (dated and undated), routines, plan routines, and a log
   of every request and answer.
   - Routines: the workouts grouped by their exercises alone (a workout joins a routine when at
     least half its exercises were in it before; a group that starts as another stops and shares 2+
     exercises continues it). Names in the file are only used to check the groups and name them;
     without names, one model call names them. The current plan is read from the last 6 weeks. **Export results JSON** saves all of it with the timings.

Enter the model's token prices to get the cost per import. With a key, the key is only saved if
"Remember key" is ticked (browser `localStorage`).

`samples/` holds made-up files: `history-strong-style.csv` (146 workouts as a tracker-app export,
about a quarter without a date), `plan-and-log-de.csv` (a German plan on top of a short log), `plan-only-de.csv` (only a
plan, no workouts: a coach's 4-day upper/lower split with abbreviations, rep ranges, RIR, rest,
supersets and an optional cardio day), and
`history-1y.csv`, `history-2y.csv`, `history-5y.csv` (about 3.5 workouts a week; every ~4 months
some exercises change, so the names grow from 39 to 74):

| File             | Rows   | Workouts | Exercise names |
| ---------------- | ------ | -------- | -------------- |
| `history-1y.csv` | 3,219  | 170      | 39             |
| `history-2y.csv` | 7,119  | 376      | 59             |
| `history-5y.csv` | 16,423 | 867      | 74             |

`hevy-1y.csv`, `hevy-2y.csv` and `hevy-5y.csv` hold the same workouts in the layout of Hevy's CSV
export (`title`, `start_time`, `exercise_title`, `set_index` from 0, `set_type` with warm-up,
failure and drop sets, `weight_kg`, …), every workout dated.

`messy-5000.csv` (5,000 sets, 266 workouts) is the hard case: about a fifth of the workouts
without a date, and 67 exercise names as people type them, German and English mixed, with typos,
abbreviations, slang, an emoji and a few nobody can match ("Mystery Machine 3", "Übung 7"); some
weights read "62,5" or "80 kg".

`node scripts/csv-import-lab/make-sample.mjs` writes them again, `make-messy.mjs` the messy one.
