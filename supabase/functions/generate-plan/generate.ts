// What the model is asked to build from the onboarding answers, and how its answer becomes a plan
// the app can take as it is: one day per training day, sessions that fit the chosen length, sets
// and reps in sensible ranges. Plain TypeScript without Deno APIs, so it can be tested outside the
// Edge runtime.

import type { ImportedDay, ImportedExercise } from '../_shared/plan-events.ts';
import type { CatalogRow } from '../_shared/plans.ts';

export const GOALS = ['hypertrophy', 'strength', 'strength_hypertrophy'] as const;
export const EQUIPMENT_ACCESS = ['gym', 'home', 'bodyweight'] as const;
export const EXPERIENCE_LEVELS = ['none', 'beginner', 'intermediate', 'advanced'] as const;
/** The muscles the app's focus step offers (its MuscleId). */
export const FOCUS_MUSCLES = [
  'abs',
  'adductors',
  'biceps',
  'calves',
  'chest',
  'forearms',
  'front_delts',
  'glutes',
  'hamstrings',
  'lats',
  'lower_back',
  'neck',
  'obliques',
  'quads',
  'rear_delts',
  'side_delts',
  'tibialis',
  'traps',
  'triceps',
  'upper_back',
] as const;

/** The onboarding answers a plan is made from; no name, no body data. */
export interface PlanAnswers {
  goal: (typeof GOALS)[number];
  focus: string[];
  equipment: (typeof EQUIPMENT_ACCESS)[number];
  /** Monday-based weekday indexes, in order. */
  trainingDays: number[];
  sessionMinutes: number;
  experience: (typeof EXPERIENCE_LEVELS)[number] | null;
}

const oneOf = <T extends string>(list: readonly T[], value: unknown): value is T =>
  typeof value === 'string' && (list as readonly string[]).includes(value);

/** The answers from the request body, or null when they aren't valid. */
export function parseAnswers(value: unknown): PlanAnswers | null {
  if (!value || typeof value !== 'object') return null;
  const a = value as Record<string, unknown>;
  const days = a.trainingDays;
  const minutes = a.sessionMinutes;
  if (
    !oneOf(GOALS, a.goal) ||
    !oneOf(EQUIPMENT_ACCESS, a.equipment) ||
    !(a.experience === null || oneOf(EXPERIENCE_LEVELS, a.experience)) ||
    !Array.isArray(a.focus) ||
    a.focus.length > FOCUS_MUSCLES.length ||
    !a.focus.every((m) => oneOf(FOCUS_MUSCLES, m)) ||
    !Array.isArray(days) ||
    !days.length ||
    !days.every((d) => Number.isInteger(d) && d >= 0 && d <= 6) ||
    new Set(days).size !== days.length ||
    typeof minutes !== 'number' ||
    !Number.isInteger(minutes) ||
    minutes < 10 ||
    minutes > 180
  ) {
    return null;
  }
  return {
    goal: a.goal,
    focus: [...new Set(a.focus as string[])],
    equipment: a.equipment,
    trainingDays: [...(days as number[])].sort((x, y) => x - y),
    sessionMinutes: minutes,
    experience: a.experience as PlanAnswers['experience'],
  };
}

/** Equipment each answer allows. */
const EQUIPMENT: Record<PlanAnswers['equipment'], readonly string[]> = {
  gym: ['barbell', 'dumbbell', 'kettlebell', 'machine', 'cable', 'bodyweight'],
  home: ['barbell', 'dumbbell', 'kettlebell', 'bodyweight'],
  bodyweight: ['bodyweight'],
};
/** Catalog exercises that also work without their listed equipment. */
const ALSO_AT: Partial<Record<PlanAnswers['equipment'], readonly string[]>> = {
  home: ['calf-raise'],
  bodyweight: ['lunge', 'calf-raise'],
};

/** The catalog exercises the plan may use: the user's equipment, no cardio. */
export const usableExercises = (catalog: CatalogRow[], equipment: PlanAnswers['equipment']) =>
  catalog.filter(
    (e) =>
      !e.cardio &&
      (EQUIPMENT[equipment].includes(e.equipment) || !!ALSO_AT[equipment]?.includes(e.id)),
  );

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// The app's estimate (estimateMinutes in src/shared/data/templates.ts): set-up per exercise, and
// per set its work and its rest.
const EXERCISE_SECONDS = 150;
const SET_SECONDS = 45;

export const INSTRUCTIONS = `You are a strength coach writing a training plan for a gym app. The user answered a few questions; build the plan from them, using only exercises from the catalog below, by id.

Days:
- Exactly one day per training day, in the order given: day 1 is on the first weekday listed, day 2 on the second, and so on.
- Pick the split from the number of days and the experience. 1 day: full body. 2 days: full body A/B, or upper/lower for intermediate and advanced. 3 days: full body A/B/C for none and beginner, else push/pull/legs or full body. 4 days: upper/lower twice. 5 days: push/pull/legs plus upper/lower. 6 days: push/pull/legs twice. 7 days: like 6, with a lighter full-body day.
- Days that train the same muscles should not follow each other when the weekdays allow it.

Each day:
- Fits the session length. A session takes about 2.5 minutes per exercise to set up, plus for every set 45 seconds of work and its rest. Rather leave out an isolation exercise than go below 2 sets.
- Starts with the big compound lifts, then accessories, then isolation work; core last.
- Never the same exercise twice in a day. Across days of the same type (e.g. upper A and upper B), vary the exercises where it makes sense.

The week:
- About as many pulling as pushing sets; chest, back, shoulders, arms, quads, hamstrings and glutes each trained at least once a week, twice with 3 or more days.
- Focus muscles, if any, get about a third more weekly sets than the rest: an extra exercise or set on their days. Without focus, keep it balanced.

Experience:
- none and beginner: simple, stable exercises (machines, cables, dumbbells), 2-3 sets each, 4-6 exercises a day, no very technical lifts (no Olympic lifts, no conventional deadlift for none).
- intermediate: 3-4 sets per exercise.
- advanced: 3-5 sets, heavier compounds and more variety.
- Unknown experience: plan as for beginner.

Sets:
- target_min and target_max are the rep range of every set (equal for a fixed number); rir is the reps in reserve.
- hypertrophy: compounds 6-10 reps, isolation 10-15, rir 1-2. strength: main lifts 3-6 reps at rir 2-3, accessories 6-10. strength_hypertrophy: compounds 4-8, isolation 8-12, rir 1-3. none and beginner: one rir more.
- Exercises marked "timed" are held: target_min and target_max are seconds (e.g. 30-45) and rir is null.
- rest_seconds: compounds 120-180 (up to 240 for heavy strength work), isolation 60-90.

Names, in the app language given below: each day a short name (at most 24 characters), e.g. "Push", "Oberkörper A", "Beine"; the plan a short name for the split (at most 30 characters), e.g. "Push Pull Beine", "Ganzkörper 3×".`;

/** The main muscles of an exercise, most worked first. */
const mainMuscles = (muscles: Record<string, number>) =>
  Object.entries(muscles)
    .filter(([, share]) => share >= 0.2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([muscle]) => muscle)
    .join(', ');

/** The answers and the usable catalog as the model reads them. */
export function contextText(answers: PlanAnswers, catalog: CatalogRow[], language: string) {
  const languages = [...new Set([language, 'de', 'en'])];
  const lines = catalog.map((e) => {
    const names = [...new Set(languages.map((l) => e.name[l]).filter(Boolean))].join(' / ');
    const logs = e.measures.includes('seconds') ? 'timed' : 'reps';
    return `${e.id} | ${names} | ${e.equipment} | ${mainMuscles(e.muscles)} | ${logs}`;
  });
  const days = answers.trainingDays.map((d) => WEEKDAYS[d]).join(', ');
  return [
    `App language: ${language}.`,
    `Goal: ${answers.goal}.`,
    `Experience: ${answers.experience ?? 'unknown'}.`,
    `Training days: ${days} (${answers.trainingDays.length} days).`,
    `Session length: ${answers.sessionMinutes} minutes.`,
    `Focus: ${answers.focus.length ? answers.focus.join(', ') : 'none'}.`,
    `Equipment: ${answers.equipment}.`,
    '',
    'Catalog (id | names | equipment | main muscles | logs):',
    ...lines,
  ].join('\n');
}

const integer = { type: 'integer' };

/** The answer's shape; only the usable exercises' ids can be picked. */
export function buildSchema(ids: string[]) {
  const exercise = {
    type: 'object',
    additionalProperties: false,
    required: ['exercise_id', 'sets', 'target_min', 'target_max', 'rir', 'rest_seconds'],
    properties: {
      exercise_id: { type: 'string', enum: ids },
      sets: integer,
      target_min: integer,
      target_max: integer,
      rir: { anyOf: [integer, { type: 'null' }] },
      rest_seconds: integer,
    },
  };
  return {
    type: 'object',
    additionalProperties: false,
    required: ['name', 'days'],
    properties: {
      name: { type: 'string' },
      days: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['name', 'exercises'],
          properties: {
            name: { type: 'string' },
            exercises: { type: 'array', items: exercise },
          },
        },
      },
    },
  };
}

export interface ModelExercise {
  exercise_id: string;
  sets: number;
  target_min: number;
  target_max: number;
  rir: number | null;
  rest_seconds: number;
}

/** A day of the model's answer, forced by `buildSchema`. */
export interface ModelDay {
  name: string;
  exercises: ModelExercise[];
}

const MIN_SETS = 1;
const MAX_SETS = 6;
/** A day keeps at least this many exercises, even past its time. */
const MIN_EXERCISES = 2;
const MAX_EXERCISES = 10;
/** How far past the session length a day may run before it takes no further exercises. */
const TIME_SLACK = 1.1;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(Number.isFinite(value) ? value : min)));

const cut = (text: string, max: number) => text.trim().replace(/\s+/g, ' ').slice(0, max).trim();

/**
 * Turns the model's answer into the app's plan, part by part as it streams in. Days get the
 * training days in order, and days past their number are dropped. A day leaves out repeated
 * exercises and, once it has its first two, those that would take it past the session length.
 * Sets, targets, RIR and rest are kept in sensible ranges.
 */
export function planBuilder(answers: PlanAnswers, catalog: CatalogRow[]) {
  const byId = new Map(catalog.map((e) => [e.id, e]));
  const budget = answers.sessionMinutes * 60 * TIME_SLACK;
  let dayIndex = -1;
  let used = new Set<string>();
  let seconds = 0;

  return {
    planName: (name: string) => cut(name, 30) || 'Plan',

    /** The next day, or null once every training day has one. */
    day: (day: Omit<ModelDay, 'exercises'>): ImportedDay | null => {
      dayIndex++;
      used = new Set();
      seconds = 0;
      const weekday = answers.trainingDays[dayIndex];
      if (weekday === undefined) return null;
      return { name: cut(day.name, 24) || `${dayIndex + 1}`, weekday };
    },

    /** The exercise for the current day, or null when the day leaves it out. */
    exercise: (line: ModelExercise): ImportedExercise | null => {
      const row = byId.get(line.exercise_id);
      if (!row || dayIndex >= answers.trainingDays.length || used.has(row.id)) return null;
      if (used.size >= MAX_EXERCISES) return null;
      const timed = row.measures.includes('seconds');
      const sets = clamp(line.sets, MIN_SETS, MAX_SETS);
      const rest = clamp(line.rest_seconds, 30, 300);
      const takes = EXERCISE_SECONDS + sets * (SET_SECONDS + rest);
      if (used.size >= MIN_EXERCISES && seconds + takes > budget) return null;
      used.add(row.id);
      seconds += takes;
      let min = timed ? clamp(line.target_min, 10, 300) : clamp(line.target_min, 1, 30);
      let max = timed ? clamp(line.target_max, 10, 300) : clamp(line.target_max, 1, 30);
      if (min > max) [min, max] = [max, min];
      const rir = timed || line.rir == null ? null : clamp(line.rir, 0, 4);
      return {
        exerciseId: row.id,
        sets: Array.from({ length: sets }, () => ({ targetMin: min, targetMax: max, rir })),
        restSeconds: rest,
      };
    },
  };
}
