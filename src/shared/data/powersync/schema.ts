import { DrizzleAppSchema } from '@powersync/drizzle-driver';
import { relations } from 'drizzle-orm';
import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Client-side mirror of supabase/migrations and the single source of truth for the local
// schema: the PowerSync schema below is generated from these tables. JSON columns are
// stored as text (see `parseJson`). `notNull` marks columns the server requires and every
// local insert writes; the rest can be null locally, e.g. until server defaults sync back.
// Index names are scoped per table by PowerSync.

export const profiles = sqliteTable('profiles', {
  id: text().primaryKey(),
  user_id: text().notNull(),
  first_name: text(),
  sex: text(),
  // Postgres date, synced as an ISO date (YYYY-MM-DD).
  birth_date: text(),
  unit_preference: text(),
  height_cm: integer(),
  experience: text(),
  goal: text(),
  focus: text(),
  equipment: text(),
  // JSON list of equipment ids, used with equipment = 'home'.
  home_equipment: text(),
  session_minutes: integer(),
  // The split the last plan from the answers was made with (see Split).
  split: text(),
  active_plan_id: text(),
  language: text(),
  // Path in the private "avatars" bucket; null shows the initials.
  avatar_path: text(),
  // "About you" on the profile, up to 150 characters.
  bio: text(),
  onboarded_at: text(),
  created_at: text().notNull(),
  updated_at: text().notNull(),
});

// A plan's routines come in order (`position`); `sessions_per_week` of its workouts make a plan
// week. With `block_weeks` (deload included) the plan runs in blocks; `block_start_week` is a
// plan week a block started in (any one: blocks repeat, see `blockWeekOf`).
export const plans = sqliteTable(
  'plans',
  {
    id: text().primaryKey(),
    user_id: text().notNull(),
    name: text().notNull(),
    position: integer().notNull(),
    sessions_per_week: integer().notNull(),
    block_weeks: integer(),
    block_start_week: integer().notNull(),
    created_at: text().notNull(),
  },
  (t) => [index('user').on(t.user_id)],
);

// Saved workouts: in a plan, or in the user's library without one.
export const routines = sqliteTable(
  'routines',
  {
    id: text().primaryKey(),
    user_id: text().notNull(),
    plan_id: text(),
    name: text().notNull(),
    position: integer().notNull(),
    created_at: text().notNull(),
    updated_at: text().notNull(),
  },
  (t) => [index('plan').on(t.plan_id)],
);

export const routineExercises = sqliteTable(
  'routine_exercises',
  {
    id: text().primaryKey(),
    user_id: text().notNull(),
    routine_id: text().notNull(),
    exercise_id: text().notNull(),
    position: integer().notNull(),
    rest_seconds: integer(),
  },
  (t) => [index('routine').on(t.routine_id)],
);

export const routineSets = sqliteTable(
  'routine_sets',
  {
    id: text().primaryKey(),
    user_id: text().notNull(),
    routine_exercise_id: text().notNull(),
    position: integer().notNull(),
    // Reps, or seconds for timed exercises.
    // Both optional: a target can be a range, only a minimum or maximum, or none.
    target_min: integer(),
    target_max: integer(),
    // Reps in reserve in the first week of a block.
    rir: integer(),
  },
  (t) => [index('exercise').on(t.routine_exercise_id)],
);

// Workouts done or running. One started from a plan's routine records the plan and the plan
// week it counts for.
export const workoutEntries = sqliteTable(
  'workout_entries',
  {
    id: text().primaryKey(),
    user_id: text().notNull(),
    routine_id: text(),
    plan_id: text(),
    plan_week: integer(),
    name: text().notNull(),
    started_at: text().notNull(),
    finished_at: text(),
    created_at: text().notNull(),
  },
  (t) => [index('started').on(t.started_at), index('plan').on(t.plan_id)],
);

export const workoutEntriesExercises = sqliteTable(
  'workout_entries_exercises',
  {
    id: text().primaryKey(),
    user_id: text().notNull(),
    workout_entries_id: text().notNull(),
    exercise_id: text().notNull(),
    position: integer().notNull(),
    rest_seconds: integer(),
  },
  (t) => [index('workout').on(t.workout_entries_id), index('exercise').on(t.exercise_id)],
);

export const workoutEntriesSets = sqliteTable(
  'workout_entries_sets',
  {
    id: text().primaryKey(),
    user_id: text().notNull(),
    workout_entries_exercise_id: text().notNull(),
    position: integer().notNull(),
    // The targets of the plan week the workout counts for.
    target_min: integer(),
    target_max: integer(),
    target_rir: integer(),
    weight_kg: real(),
    reps: integer(),
    // Timed exercises (planks) log seconds instead of reps.
    seconds: integer(),
    // Reps in reserve the set had (0–5, 5 meaning 5+), when entered; target_rir is the plan's.
    rir: integer(),
    completed_at: text(),
    // Postgres boolean, synced as 0/1.
    is_pr: integer({ mode: 'boolean' }).notNull(),
  },
  (t) => [index('exercise').on(t.workout_entries_exercise_id)],
);

export const progressChecks = sqliteTable('progress_checks', {
  id: text().primaryKey(),
  user_id: text().notNull(),
  score: integer().notNull(),
  group_scores: text().notNull(),
  metrics: text().notNull(),
  created_at: text().notNull(),
});

export const progressCheckPhotos = sqliteTable(
  'progress_check_photos',
  {
    id: text().primaryKey(),
    user_id: text().notNull(),
    check_id: text().notNull(),
    pose: text().notNull(),
    storage_path: text().notNull(),
    created_at: text().notNull(),
  },
  (t) => [index('check').on(t.check_id)],
);

export const tickets = sqliteTable(
  'tickets',
  {
    id: text().primaryKey(),
    user_id: text().notNull(),
    // Assigned by the server; null until it synced back.
    number: integer(),
    kind: text().notNull(),
    status: text().notNull(),
    priority: integer(),
    subject: text().notNull(),
    created_at: text().notNull(),
    updated_at: text().notNull(),
    closed_at: text(),
  },
  (t) => [index('updated').on(t.updated_at)],
);

export const ticketMessages = sqliteTable(
  'ticket_messages',
  {
    id: text().primaryKey(),
    user_id: text().notNull(),
    ticket_id: text().notNull(),
    author: text().notNull(),
    content: text().notNull(),
    attachments: text().notNull(),
    created_at: text().notNull(),
  },
  (t) => [index('ticket').on(t.ticket_id, t.created_at)],
);

export const ticketEvents = sqliteTable(
  'ticket_events',
  {
    id: text().primaryKey(),
    user_id: text().notNull(),
    ticket_id: text().notNull(),
    kind: text().notNull(),
    // Set for 'status' events; null for 'reopened'.
    status: text(),
    // App version the change ships in; rendered as a localized line.
    version: text(),
    note: text(),
    created_at: text().notNull(),
  },
  (t) => [index('ticket').on(t.ticket_id, t.created_at)],
);

// The documents themselves are read through the Supabase API, since onboarding runs logged out.
export const legalAcceptances = sqliteTable('legal_acceptances', {
  id: text().primaryKey(),
  // profiles.id, which is the auth user id.
  profile_id: text().notNull(),
  document_id: text().notNull(),
  // Set by the server on insert.
  accepted_at: text(),
  app_version: text(),
  platform: text(),
});

// Exercises the user added; routine and workout exercise_ids point at them like at the catalog.
export const customExercises = sqliteTable('custom_exercises', {
  id: text().primaryKey(),
  user_id: text().notNull(),
  name: text().notNull(),
  // JSON lists of muscle ids, as tapped in the form.
  primary_muscles: text().notNull(),
  secondary_muscles: text().notNull(),
  // JSON list of measures, e.g. ["weight","reps"].
  measures: text().notNull(),
  rest_seconds: integer().notNull(),
  archived_at: text(),
  created_at: text().notNull(),
});

// Body weight, one entry per calendar day; the id comes from user and date (`weightEntryId`).
export const weightEntries = sqliteTable(
  'weight_entries',
  {
    id: text().primaryKey(),
    user_id: text().notNull(),
    // Postgres date (YYYY-MM-DD): the user's calendar day, no time zone.
    date: text().notNull(),
    weight_kg: real().notNull(),
    created_at: text().notNull(),
  },
  (t) => [index('date').on(t.date)],
);

// Relations power nested reads such as `drizzle.query.routines.findMany({ with: … })`; Drizzle
// finds them through `drizzleSchema`. Each `many` needs the `one` pointing back.
const routinesRelations = relations(routines, ({ many }) => ({
  exercises: many(routineExercises),
}));

const routineExercisesRelations = relations(routineExercises, ({ one, many }) => ({
  routine: one(routines, { fields: [routineExercises.routine_id], references: [routines.id] }),
  sets: many(routineSets),
}));

const routineSetsRelations = relations(routineSets, ({ one }) => ({
  exercise: one(routineExercises, {
    fields: [routineSets.routine_exercise_id],
    references: [routineExercises.id],
  }),
}));

const workoutEntriesRelations = relations(workoutEntries, ({ many }) => ({
  exercises: many(workoutEntriesExercises),
}));

const workoutEntriesExercisesRelations = relations(workoutEntriesExercises, ({ one, many }) => ({
  workout: one(workoutEntries, {
    fields: [workoutEntriesExercises.workout_entries_id],
    references: [workoutEntries.id],
  }),
  sets: many(workoutEntriesSets),
}));

const workoutEntriesSetsRelations = relations(workoutEntriesSets, ({ one }) => ({
  exercise: one(workoutEntriesExercises, {
    fields: [workoutEntriesSets.workout_entries_exercise_id],
    references: [workoutEntriesExercises.id],
  }),
}));

export const drizzleSchema = {
  profiles,
  plans,
  routines,
  routineExercises,
  routineSets,
  workoutEntries,
  workoutEntriesExercises,
  workoutEntriesSets,
  progressChecks,
  progressCheckPhotos,
  tickets,
  ticketMessages,
  ticketEvents,
  legalAcceptances,
  customExercises,
  weightEntries,
  routinesRelations,
  routineExercisesRelations,
  routineSetsRelations,
  workoutEntriesRelations,
  workoutEntriesExercisesRelations,
  workoutEntriesSetsRelations,
};

export const AppSchema = new DrizzleAppSchema(drizzleSchema);

export type ProfileRecord = typeof profiles.$inferSelect;
export type ProgressCheckRecord = typeof progressChecks.$inferSelect;
export type CustomExerciseRecord = typeof customExercises.$inferSelect;
export type WeightEntryRecord = typeof weightEntries.$inferSelect;
export type TicketRecord = typeof tickets.$inferSelect;
export type TicketMessageRecord = typeof ticketMessages.$inferSelect;
export type TicketEventRecord = typeof ticketEvents.$inferSelect;
