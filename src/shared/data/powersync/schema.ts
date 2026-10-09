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
  age: integer(),
  unit_system: text(),
  weight_kg: real(),
  height_cm: integer(),
  experience: text(),
  complaints: text(),
  goal: text(),
  focus: text(),
  equipment: text(),
  training_days: text(),
  session_minutes: integer(),
  active_collection_id: text(),
  language: text(),
  onboarded_at: text(),
  created_at: text().notNull(),
  updated_at: text().notNull(),
});

export const collections = sqliteTable(
  'collections',
  {
    id: text().primaryKey(),
    user_id: text().notNull(),
    name: text().notNull(),
    position: integer().notNull(),
    created_at: text().notNull(),
  },
  (t) => [index('user').on(t.user_id)],
);

export const templates = sqliteTable(
  'templates',
  {
    id: text().primaryKey(),
    user_id: text().notNull(),
    collection_id: text(),
    name: text().notNull(),
    weekday: integer(),
    position: integer().notNull(),
    created_at: text().notNull(),
    updated_at: text().notNull(),
  },
  (t) => [index('collection').on(t.collection_id)],
);

export const templateExercises = sqliteTable(
  'template_exercises',
  {
    id: text().primaryKey(),
    user_id: text().notNull(),
    template_id: text().notNull(),
    exercise_id: text().notNull(),
    position: integer().notNull(),
    rest_seconds: integer(),
  },
  (t) => [index('template').on(t.template_id)],
);

export const templateSets = sqliteTable(
  'template_sets',
  {
    id: text().primaryKey(),
    user_id: text().notNull(),
    template_exercise_id: text().notNull(),
    position: integer().notNull(),
    reps_min: integer().notNull(),
    reps_max: integer().notNull(),
    rir: integer(),
  },
  (t) => [index('exercise').on(t.template_exercise_id)],
);

export const workouts = sqliteTable(
  'workouts',
  {
    id: text().primaryKey(),
    user_id: text().notNull(),
    template_id: text(),
    name: text().notNull(),
    started_at: text().notNull(),
    finished_at: text(),
    created_at: text().notNull(),
  },
  (t) => [index('started').on(t.started_at)],
);

export const workoutExercises = sqliteTable(
  'workout_exercises',
  {
    id: text().primaryKey(),
    user_id: text().notNull(),
    workout_id: text().notNull(),
    exercise_id: text().notNull(),
    position: integer().notNull(),
    rest_seconds: integer(),
  },
  (t) => [index('workout').on(t.workout_id), index('exercise').on(t.exercise_id)],
);

export const workoutSets = sqliteTable(
  'workout_sets',
  {
    id: text().primaryKey(),
    user_id: text().notNull(),
    workout_exercise_id: text().notNull(),
    position: integer().notNull(),
    target_min: integer(),
    target_max: integer(),
    target_rir: integer(),
    weight_kg: real(),
    reps: integer(),
    completed_at: text(),
    // Postgres boolean, synced as 0/1.
    is_pr: integer({ mode: 'boolean' }).notNull(),
  },
  (t) => [index('exercise').on(t.workout_exercise_id)],
);

export const bodyChecks = sqliteTable('body_checks', {
  id: text().primaryKey(),
  user_id: text().notNull(),
  score: integer().notNull(),
  group_scores: text().notNull(),
  metrics: text().notNull(),
  created_at: text().notNull(),
});

export const bodyCheckPhotos = sqliteTable(
  'body_check_photos',
  {
    id: text().primaryKey(),
    user_id: text().notNull(),
    body_check_id: text().notNull(),
    pose: text().notNull(),
    storage_path: text(),
    created_at: text().notNull(),
  },
  (t) => [index('check').on(t.body_check_id)],
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
    body: text().notNull(),
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

// Relations power nested reads such as `drizzle.query.templates.findMany({ with: … })`.
export const templatesRelations = relations(templates, ({ many }) => ({
  exercises: many(templateExercises),
}));

export const templateExercisesRelations = relations(templateExercises, ({ one, many }) => ({
  template: one(templates, { fields: [templateExercises.template_id], references: [templates.id] }),
  sets: many(templateSets),
}));

export const templateSetsRelations = relations(templateSets, ({ one }) => ({
  exercise: one(templateExercises, {
    fields: [templateSets.template_exercise_id],
    references: [templateExercises.id],
  }),
}));

export const workoutsRelations = relations(workouts, ({ many }) => ({
  exercises: many(workoutExercises),
}));

export const workoutExercisesRelations = relations(workoutExercises, ({ one, many }) => ({
  workout: one(workouts, { fields: [workoutExercises.workout_id], references: [workouts.id] }),
  sets: many(workoutSets),
}));

export const workoutSetsRelations = relations(workoutSets, ({ one }) => ({
  exercise: one(workoutExercises, {
    fields: [workoutSets.workout_exercise_id],
    references: [workoutExercises.id],
  }),
}));

export const drizzleSchema = {
  profiles,
  collections,
  templates,
  templateExercises,
  templateSets,
  workouts,
  workoutExercises,
  workoutSets,
  bodyChecks,
  bodyCheckPhotos,
  tickets,
  ticketMessages,
  ticketEvents,
  legalAcceptances,
  templatesRelations,
  templateExercisesRelations,
  templateSetsRelations,
  workoutsRelations,
  workoutExercisesRelations,
  workoutSetsRelations,
};

export const AppSchema = new DrizzleAppSchema(drizzleSchema);

export type ProfileRecord = typeof profiles.$inferSelect;
export type TemplateSetRecord = typeof templateSets.$inferSelect;
export type BodyCheckRecord = typeof bodyChecks.$inferSelect;
export type TicketRecord = typeof tickets.$inferSelect;
export type TicketMessageRecord = typeof ticketMessages.$inferSelect;
export type TicketEventRecord = typeof ticketEvents.$inferSelect;
