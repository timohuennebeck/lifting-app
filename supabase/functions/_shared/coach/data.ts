// The training data the coach's tools read, loaded for one user: finished workouts with their
// completed sets, body weight entries and body check scores. Weights are stored in kg; the tools
// convert them to the user's units. Set values follow the app (src/shared/data/workouts.ts).

export type Measure = 'weight' | 'reps' | 'seconds';
export type Units = 'metric' | 'imperial';

export interface CoachExercise {
  id: string;
  /** In the user's language. */
  name: string;
  measures: Measure[];
  /** A set counts fully for its main muscles and half for the helpers (see `splitShares`). */
  primary: string[];
  secondary: string[];
  /** The logged weight is added to the body weight (pull-ups)… */
  bodyweight: boolean;
  /** …or taken off it (assisted pull-up machine). */
  assisted: boolean;
  /** Cardio stays out of the muscle and volume numbers. */
  cardio: boolean;
}

/** A catalog exercise a workout can be built from. */
export interface CoachCatalogExercise {
  id: string;
  /** In the user's language. */
  name: string;
  /** The kind of equipment it takes: barbell, dumbbell, machine, cable, bodyweight… */
  equipment: string;
  measures: Measure[];
  /** Share of the training stimulus per muscle. */
  muscles: Record<string, number>;
  /** Rest between sets of 8 reps or more; heavier sets get longer (see `restAfterSet`). */
  restSeconds: number;
  /** The equipment in the user's profile allows it. */
  usable: boolean;
}

export interface CoachSet {
  weightKg: number | null;
  reps: number | null;
  seconds: number | null;
  rir: number | null;
}

export interface CoachWorkout {
  name: string;
  startedAt: string;
  finishedAt: string;
  exercises: { exerciseId: string; sets: CoachSet[] }[];
}

/** An exercise of a workout on a card, with one target for all its sets. */
export interface WorkoutLine {
  exerciseId: string;
  sets: number;
  /** Reps of every set, or seconds for an exercise that logs seconds; null without a target. */
  targetMin: number | null;
  targetMax: number | null;
  rir: number | null;
  /** null: the exercise's own rest. */
  restSeconds: number | null;
}

/** A workout the user saved. */
export interface CoachRoutine {
  id: string;
  name: string;
  /** Where it stands in the active plan's week; null outside the plan. */
  status: 'done' | 'next' | 'open' | null;
  exercises: WorkoutLine[];
}

export interface CoachData {
  /** Every exercise the workouts use. */
  exercises: Map<string, CoachExercise>;
  /** The app's catalog without cardio, for building a workout. */
  catalog: CoachCatalogExercise[];
  /** Finished workouts, oldest first, with their completed sets. */
  workouts: CoachWorkout[];
  /** The active plan's workouts in their order, then the ones outside a plan. */
  routines: CoachRoutine[];
  /** Oldest first. */
  weights: { date: string; kg: number }[];
  checks: { date: string; score: number }[];
}

export interface CoachUser {
  /** The user's calendar day (YYYY-MM-DD) in `timeZone`. */
  today: string;
  timeZone: string;
  units: Units;
  language: string;
}

/** Splits catalog muscle shares as the app does: the top muscle and any from 30 % are main. */
export function splitShares(shares: Record<string, number>) {
  const sorted = Object.entries(shares).sort((a, b) => b[1] - a[1]);
  return {
    primary: sorted.filter(([, share], i) => i === 0 || share >= 0.3).map(([muscle]) => muscle),
    secondary: sorted.filter(([, share], i) => i > 0 && share < 0.3).map(([muscle]) => muscle),
  };
}

// ---------- days ----------

const DAY_MS = 86_400_000;
const dayFormats = new Map<string, Intl.DateTimeFormat>();

/** The calendar day (YYYY-MM-DD) an instant falls on in a time zone. */
export function dayIn(instant: string, timeZone: string) {
  let format = dayFormats.get(timeZone);
  if (!format) {
    format = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    dayFormats.set(timeZone, format);
  }
  return format.format(new Date(instant));
}

const timeOf = (day: string) => Date.parse(`${day}T00:00:00Z`);

export const isDay = (value: unknown): value is string =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(timeOf(value));

export const addDays = (day: string, days: number) =>
  new Date(timeOf(day) + days * DAY_MS).toISOString().slice(0, 10);

export const daysBetween = (from: string, to: string) =>
  Math.round((timeOf(to) - timeOf(from)) / DAY_MS);

export const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

export const weekdayOf = (day: string) => WEEKDAYS[(new Date(timeOf(day)).getUTCDay() + 6) % 7];

/** Monday of the day's week: weeks run Monday to Sunday. */
export const weekStart = (day: string) => addDays(day, -WEEKDAYS.indexOf(weekdayOf(day)));

export const monthStart = (day: string) => `${day.slice(0, 7)}-01`;

/** The first day of the month before. */
export function previousMonth(day: string) {
  const date = new Date(timeOf(monthStart(day)));
  date.setUTCMonth(date.getUTCMonth() - 1);
  return date.toISOString().slice(0, 10);
}

export const daysInMonth = (day: string) => {
  const date = new Date(timeOf(monthStart(day)));
  date.setUTCMonth(date.getUTCMonth() + 1, 0);
  return date.getUTCDate();
};

// ---------- values ----------

/** For bodyweight exercises without a body weight entry, as in the app. */
const DEFAULT_BODY_WEIGHT_KG = 78;
const KG_PER_LB = 0.45359237;

/** The app scores bodyweight sets with the latest body weight, so the coach does too. */
export const latestBodyWeight = (data: CoachData) =>
  data.weights.at(-1)?.kg ?? DEFAULT_BODY_WEIGHT_KG;

export const inUnits = (kg: number, units: Units) => (units === 'imperial' ? kg / KG_PER_LB : kg);

export const weightUnit = (units: Units) => (units === 'imperial' ? 'lb' : 'kg');

export const round = (value: number, digits = 1) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

export type ExerciseMetric = 'e1rm' | 'top_weight' | 'reps' | 'seconds' | 'volume';

/** The load a set moves: the weight, or the body weight plus the added weight or minus the help. */
function loadKg(exercise: CoachExercise, set: CoachSet, bodyKg: number) {
  if (set.weightKg == null) return null;
  if (exercise.bodyweight) return bodyKg + set.weightKg;
  if (exercise.assisted) return Math.max(bodyKg - set.weightKg, 0);
  return set.weightKg;
}

function setValue(metric: ExerciseMetric, exercise: CoachExercise, set: CoachSet, bodyKg: number) {
  switch (metric) {
    case 'e1rm': {
      // Epley, as the app ranks sets: load × (1 + reps / 30).
      const load = loadKg(exercise, set, bodyKg);
      return load != null && set.reps ? load * (1 + set.reps / 30) : null;
    }
    case 'top_weight':
      return exercise.assisted ? null : set.weightKg;
    case 'reps':
      return set.reps;
    case 'seconds':
      return set.seconds;
    case 'volume':
      // Bodyweight exercises count the added weight; an assisted machine's weight isn't lifted.
      return exercise.assisted || set.weightKg == null || set.reps == null
        ? null
        : set.weightKg * set.reps;
  }
}

/** A session's value from its sets of one exercise (best set, or the sum for volume), in kg. */
export function sessionValue(
  metric: ExerciseMetric,
  exercise: CoachExercise,
  sets: CoachSet[],
  bodyKg: number,
) {
  const values = sets
    .map((set) => setValue(metric, exercise, set, bodyKg))
    .filter((value): value is number => value != null);
  if (!values.length) return null;
  return metric === 'volume' ? values.reduce((a, b) => a + b, 0) : Math.max(...values);
}

/** Weight × reps of a workout in kg, cardio left out. */
export function workoutVolumeKg(workout: CoachWorkout, data: CoachData) {
  let total = 0;
  for (const { exerciseId, sets } of workout.exercises) {
    const exercise = data.exercises.get(exerciseId);
    if (!exercise || exercise.cardio) continue;
    total += sessionValue('volume', exercise, sets, 0) ?? 0;
  }
  return total;
}

/** Completed sets of a workout, cardio left out. */
export const workoutSets = (workout: CoachWorkout, data: CoachData) =>
  workout.exercises
    .filter((e) => !data.exercises.get(e.exerciseId)?.cardio)
    .reduce((n, e) => n + e.sets.length, 0);

export const workoutMinutes = (workout: CoachWorkout) =>
  Math.round((Date.parse(workout.finishedAt) - Date.parse(workout.startedAt)) / 60_000);
