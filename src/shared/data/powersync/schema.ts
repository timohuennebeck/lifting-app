import { column, Schema, Table } from '@powersync/react-native';

// Client-side mirror of supabase/migrations. JSON columns are stored as text.
const profiles = new Table({
  user_id: column.text,
  first_name: column.text,
  sex: column.text,
  age: column.integer,
  unit_system: column.text,
  weight_kg: column.real,
  height_cm: column.integer,
  experience: column.text,
  complaints: column.text,
  goal: column.text,
  focus: column.text,
  equipment: column.text,
  training_days: column.text,
  session_minutes: column.integer,
  active_collection_id: column.text,
  onboarded_at: column.text,
  created_at: column.text,
  updated_at: column.text,
});

const collections = new Table(
  { user_id: column.text, name: column.text, position: column.integer, created_at: column.text },
  { indexes: { user: ['user_id'] } },
);

const templates = new Table(
  {
    user_id: column.text,
    collection_id: column.text,
    name: column.text,
    weekday: column.integer,
    position: column.integer,
    created_at: column.text,
    updated_at: column.text,
  },
  { indexes: { collection: ['collection_id'] } },
);

const template_exercises = new Table(
  {
    user_id: column.text,
    template_id: column.text,
    exercise_id: column.text,
    position: column.integer,
    rest_seconds: column.integer,
  },
  { indexes: { template: ['template_id'] } },
);

const template_sets = new Table(
  {
    user_id: column.text,
    template_exercise_id: column.text,
    position: column.integer,
    reps_min: column.integer,
    reps_max: column.integer,
    rir: column.integer,
  },
  { indexes: { exercise: ['template_exercise_id'] } },
);

const workouts = new Table(
  {
    user_id: column.text,
    template_id: column.text,
    name: column.text,
    started_at: column.text,
    finished_at: column.text,
    created_at: column.text,
  },
  { indexes: { started: ['started_at'] } },
);

const workout_exercises = new Table(
  {
    user_id: column.text,
    workout_id: column.text,
    exercise_id: column.text,
    position: column.integer,
    rest_seconds: column.integer,
  },
  { indexes: { workout: ['workout_id'], exercise: ['exercise_id'] } },
);

const workout_sets = new Table(
  {
    user_id: column.text,
    workout_exercise_id: column.text,
    position: column.integer,
    target_min: column.integer,
    target_max: column.integer,
    target_rir: column.integer,
    weight_kg: column.real,
    reps: column.integer,
    completed_at: column.text,
    is_pr: column.integer,
  },
  { indexes: { exercise: ['workout_exercise_id'] } },
);

const body_checks = new Table({
  user_id: column.text,
  score: column.integer,
  group_scores: column.text,
  metrics: column.text,
  created_at: column.text,
});

const body_check_photos = new Table(
  {
    user_id: column.text,
    body_check_id: column.text,
    pose: column.text,
    storage_path: column.text,
    created_at: column.text,
  },
  { indexes: { check: ['body_check_id'] } },
);

const tickets = new Table(
  {
    user_id: column.text,
    number: column.integer,
    kind: column.text,
    status: column.text,
    priority: column.integer,
    subject: column.text,
    created_at: column.text,
    updated_at: column.text,
    closed_at: column.text,
  },
  { indexes: { updated: ['updated_at'] } },
);

const ticket_messages = new Table(
  {
    user_id: column.text,
    ticket_id: column.text,
    author: column.text,
    body: column.text,
    attachments: column.text,
    created_at: column.text,
  },
  { indexes: { ticket: ['ticket_id', 'created_at'] } },
);

export const AppSchema = new Schema({
  profiles,
  collections,
  templates,
  template_exercises,
  template_sets,
  workouts,
  workout_exercises,
  workout_sets,
  body_checks,
  body_check_photos,
  tickets,
  ticket_messages,
});

export type Database = (typeof AppSchema)['types'];
export type ProfileRecord = Database['profiles'];
export type TemplateSetRecord = Database['template_sets'];
export type BodyCheckRecord = Database['body_checks'];
