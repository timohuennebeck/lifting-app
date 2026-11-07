// The limits the app, the database and the Edge Functions share, in one place. The app reads them
// through src/shared/lib/limits.ts, the functions import this file, and the database's checks
// (supabase/migrations) hold the same values or wider ones. No imports, so both sides use it as
// it is.

// Texts people type; the fields show how much is left.

/** First name: onboarding and the profile. */
export const FIRST_NAME_MAX = 24;
/** The description on the profile ("Über dich"). */
export const BIO_MAX = 150;
/** A plan: creating, renaming, the import review, and the names the AI gives. */
export const PLAN_NAME_MAX = 30;
/** A routine: creating, renaming, its title, and the names the AI and the coach give. */
export const ROUTINE_NAME_MAX = 40;
/** A custom exercise's name, also one an import or the AI makes. */
export const CUSTOM_EXERCISE_NAME_MAX = 60;
/** A support message; a ticket's subject is its first line, cut to TICKET_SUBJECT_MAX. */
export const TICKET_MESSAGE_MAX = 5000;
export const TICKET_SUBJECT_MAX = 120;
/** A question to the coach, and an answer as it is stored. */
export const COACH_QUESTION_MAX = 500;
export const COACH_ANSWER_MAX = 2000;

// A set: its targets in a routine or a plan, and what is logged. The database takes targets up
// to 600 for reps and seconds alike; the app's editor, the AI and the coach keep reps to 60.

/** Reps a set aims for, at most. */
export const TARGET_REPS_MAX = 60;
/** Seconds a timed set aims for, at most. */
export const TARGET_SECONDS_MAX = 600;
/** Reps in reserve, 0 to 5 (5 reads "5+"). */
export const RIR_MAX = 5;
/** Rest between sets, in seconds. */
export const REST_SECONDS_MAX = 600;
/** Reps logged in one set (workout_entries_sets), and a weight in kg (numeric(6, 2)). */
export const LOGGED_REPS_MAX = 999;
export const WEIGHT_KG_MAX = 9999.99;

// What the app sends the AI functions.

/** What was said for voice input (read-exercises). */
export const SPOKEN_TEXT_MAX = 4000;
/** A file's plan rows as text (read-workout-file, step "plan"). */
export const PLAN_TEXT_MAX = 60_000;
/** A workbook's sheets read at once (read-workout-file, step "categorize"). */
export const IMPORT_SHEETS_MAX = 20;
/** Exercise names per request (read-workout-file, step "map"). */
export const IMPORT_NAMES_MAX = 80;

/** Age from which the progress check (photos of the body) can be used. */
export const PROGRESS_CHECK_MIN_AGE = 18;
