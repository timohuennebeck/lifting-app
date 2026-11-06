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
5. **Results:** mapping table, workouts (dated and undated), plan routines, and a log of every
   request and answer. **Export results JSON** saves all of it with the timings.

Enter the model's token prices to get the cost per import. With a key, the key is only saved if
"Remember key" is ticked (browser `localStorage`).

`samples/` holds made-up files: `history-strong-style.csv` (146 workouts as a tracker-app export,
about a quarter without a date) and `plan-and-log-de.csv` (a German plan on top of a short log).
`node scripts/csv-import-lab/make-sample.mjs` writes them again.
