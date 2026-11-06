# Import samples

Made-up workout files to try the workout import with (Training › Plan importieren, or onboarding's
"Bring dein Training mit"). Not part of the app.

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
