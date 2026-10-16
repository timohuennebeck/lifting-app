// What the model is asked to build from the plan flow's answers, and how its answer becomes a plan
// the app can take as it is: one routine per workout a week, sessions that fit the chosen length,
// sets and reps in sensible ranges. Plain TypeScript without Deno APIs, so it can be tested outside the
// Edge runtime.

import {
  catalogNames,
  cut,
  type ImportedRoutine,
  MUSCLES,
  type PlanExercise,
} from '../_shared/plan-events.ts';
import type { CatalogRow, EquipmentRow } from '../_shared/plans.ts';

export const GOALS = ['hypertrophy', 'strength', 'strength_hypertrophy'] as const;
export const EQUIPMENT_ACCESS = ['gym', 'home', 'bodyweight'] as const;
export const EXPERIENCE_LEVELS = ['none', 'beginner', 'intermediate', 'advanced'] as const;
/** How the routines divide the body; the app offers those that suit the workouts a week. */
export const SPLITS = [
  'full_body',
  'upper_lower',
  'ppl',
  'ppl_upper_lower',
  'bro',
  'arnold',
] as const;

/** The plan flow's answers a plan is made from; no name, no body data. */
export interface PlanAnswers {
  goal: (typeof GOALS)[number];
  focus: string[];
  equipment: (typeof EQUIPMENT_ACCESS)[number];
  /** With equipment "home": the equipment ids the user has (public.equipment). */
  homeEquipment: string[];
  /** Workouts a week: the plan has one routine for each, done in turn on any days. */
  sessionsPerWeek: number;
  /** The split the user picked; null from app versions that don't ask, then the model picks. */
  split: (typeof SPLITS)[number] | null;
  sessionMinutes: number;
  experience: (typeof EXPERIENCE_LEVELS)[number] | null;
}

const oneOf = <T extends string>(list: readonly T[], value: unknown): value is T =>
  typeof value === 'string' && (list as readonly string[]).includes(value);

const MAX_HOME_EQUIPMENT = 50;
const MAX_SESSIONS_PER_WEEK = 7;
const isSlug = (value: unknown) =>
  typeof value === 'string' && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value);

/** The answers from the request body, or null when they aren't valid. */
export function parseAnswers(value: unknown): PlanAnswers | null {
  if (!value || typeof value !== 'object') return null;
  const a = value as Record<string, unknown>;
  const sessions = a.sessionsPerWeek;
  const minutes = a.sessionMinutes;
  const home = a.homeEquipment;
  if (
    !oneOf(GOALS, a.goal) ||
    !oneOf(EQUIPMENT_ACCESS, a.equipment) ||
    !(a.experience === null || oneOf(EXPERIENCE_LEVELS, a.experience)) ||
    !(a.split == null || oneOf(SPLITS, a.split)) ||
    !Array.isArray(a.focus) ||
    a.focus.length > MUSCLES.length ||
    !a.focus.every((m) => oneOf(MUSCLES, m)) ||
    typeof sessions !== 'number' ||
    !Number.isInteger(sessions) ||
    sessions < 1 ||
    sessions > MAX_SESSIONS_PER_WEEK ||
    typeof minutes !== 'number' ||
    !Number.isInteger(minutes) ||
    minutes < 10 ||
    minutes > 180 ||
    !Array.isArray(home) ||
    home.length > MAX_HOME_EQUIPMENT ||
    !home.every(isSlug)
  ) {
    return null;
  }
  return {
    goal: a.goal,
    focus: [...new Set(a.focus as string[])],
    equipment: a.equipment,
    homeEquipment: a.equipment === 'home' ? [...new Set(home as string[])] : [],
    sessionsPerWeek: sessions,
    split: oneOf(SPLITS, a.split) ? a.split : null,
    sessionMinutes: minutes,
    experience: a.experience as PlanAnswers['experience'],
  };
}

/**
 * The equipment the user has, of the active catalog's: what a full gym has, the ticked items at
 * home, nothing for "bodyweight".
 */
export function equipmentOf(answers: PlanAnswers, equipment: EquipmentRow[]) {
  if (answers.equipment === 'gym') {
    return new Set(equipment.filter((e) => e.in_gym).map((e) => e.id));
  }
  const active = new Set(equipment.map((e) => e.id));
  return new Set(answers.homeEquipment.filter((id) => active.has(id)));
}

/** Whether the user can do an exercise: each of its needs met by one of their items. */
export const fits = (needs: string[][], have: Set<string>) =>
  needs.every((items) => items.some((id) => have.has(id)));

const CORE_MUSCLES = ['abs', 'obliques'];
/** Core work: abs and obliques take at least half of the exercise's stimulus. */
const isCore = (muscles: Record<string, number>) =>
  CORE_MUSCLES.reduce((sum, m) => sum + (muscles[m] ?? 0), 0) >= 0.5;

/**
 * The catalog exercises the plan may use: what the user's equipment allows, no cardio and no
 * timed holds (planks, wall sits). The strength goals get core work only with abs or obliques as
 * a focus: the main lifts already train the trunk.
 */
export function usableExercises(catalog: CatalogRow[], have: Set<string>, answers: PlanAnswers) {
  const core =
    answers.goal === 'hypertrophy' || answers.focus.some((m) => CORE_MUSCLES.includes(m));
  return catalog.filter(
    (e) =>
      !e.cardio &&
      !e.measures.includes('seconds') &&
      fits(e.needs, have) &&
      (core || !isCore(e.muscles)),
  );
}

// The app's estimate (estimateMinutes in src/shared/data/routines.ts): set-up per exercise, and
// per set its work and its rest.
const EXERCISE_SECONDS = 150;
const SET_SECONDS = 45;

export const INSTRUCTIONS = `You are a strength coach writing a training plan for a gym app. The user answered a few questions; build the plan from them, using only exercises from the catalog below, by id.

Routines:
- Exactly one routine per workout a week. The user does them in the order you write them, one after another on whatever days suit them, then starts over.
- Build the split the user picked (below):
  - full_body: every routine trains the whole body; vary the exercises between them (A/B/C).
  - upper_lower: upper-body and lower-body routines in turn (upper A, lower A, upper B, lower B, …).
  - ppl: push, pull, legs in that order; with 6, twice with varied exercises; with 7, twice plus a lighter full-body routine.
  - ppl_upper_lower: push, pull, legs, upper, lower.
  - bro: one area a routine: chest, back, legs, shoulders, arms.
  - arnold: chest and back, shoulders and arms, legs; twice with varied exercises.
- Without a split, pick one from the workouts a week and the experience. 1: full body. 2: full body A/B, or upper/lower for intermediate and advanced. 3: full body A/B/C for none and beginner, else push/pull/legs or full body. 4: upper/lower twice. 5: push/pull/legs plus upper/lower. 6: push/pull/legs twice. 7: like 6, with a lighter full-body routine.
- Routines that train the same muscles should not follow each other in the order.

Each routine:
- Fits the session length. A session takes about 2.5 minutes per exercise to set up, plus for every set 45 seconds of work and its rest. Rather leave out an isolation exercise than go below 2 sets.
- Uses that length too: at least about 80% of it, within the sets and exercises the experience allows. With long sessions, first give the main exercises more sets (up to 5), then add exercises.
- Every exercise should build muscle or strength. Low-load drills (bird dog, donkey kick, fire hydrant, tibialis raise and the like) are no filler: only when the equipment leaves nothing better for that muscle.
- Starts with the big compound lifts, then accessories, then isolation work.
- Core exercises (main muscles abs or obliques), when the catalog has any: at most one per routine, always last. With abs or obliques as a focus, one in most routines; else with hypertrophy, one in 1-2 routines a week. Prefer ones that can be loaded or progressed (cable crunch, hanging leg raise, ab wheel).
- Never the same exercise twice in a routine. Across routines of the same type (e.g. upper A and upper B), vary the exercises where it makes sense.

The week:
- About as many pulling as pushing sets; chest, back, shoulders, arms, quads, hamstrings and glutes each trained at least once a week, and as often as the split trains that area (e.g. twice with full body 2×, upper/lower 4× or push/pull/legs 6×; once with the bro split).
- Focus muscles, if any, get about a third more weekly sets than the rest: every routine that trains a focus muscle gets an extra exercise for it, picked from its focus exercises below, and when time is short, take the sets from other isolation work. A focus muscle's main lift gets at least as many sets as the routine's other main lifts. Without focus, keep it balanced.

Experience:
- none and beginner: simple, stable exercises (machines, cables, dumbbells), 2-3 sets each, 4-6 exercises a routine, no very technical lifts (no Olympic lifts, no conventional deadlift for none).
- intermediate: 3-4 sets per exercise.
- advanced: 3-5 sets, heavier compounds and more variety.
- Unknown experience: plan as for beginner.

Little equipment (bodyweight, kettlebell, bands): these can't be loaded heavily, so whatever the goal:
- Use everything the user has: with a kettlebell, goblet squats, Romanian deadlifts, rows, presses and lunges, not only swings.
- Harder variations over easy ones: lunges, split squats and single-leg work over air squats once the experience isn't none or beginner.
- Bodyweight exercises 10-20 reps, rest 60-90 s.
- Short sessions (30 minutes or less): rest 60-90 s and 2-3 sets, so that at least 3 exercises fit.

Sets:
- target_min and target_max are the rep range of every set (equal for a fixed number); rir is the reps in reserve in the first week.
- The app runs the plan in blocks of 5 weeks: each week after the first takes one rep off the reserve (never below 0), and the fifth week is a lighter deload. So rir is where a block starts.
- hypertrophy: compounds 6-10 reps, isolation 10-15, rir 3. strength: main lifts 3-6 reps at rir 3-4, compound accessories 6-10 and isolation 8-15 at rir 3. strength_hypertrophy: compounds 4-8, isolation 8-12, rir 3. none and beginner: rir 4 on compounds, 3 on isolation.
- strength: build each routine around one or two main lifts (squat, bench press, deadlift, overhead press, barbell row or pull-up; their closest variant the equipment allows), then 2-4 accessories that support them. Fewer exercises with more sets rather than many isolation exercises.
- rest_seconds: compounds 120-180 (up to 240 for heavy strength work), isolation 60-90.

Names, in the app language given below: each routine a short name (at most 24 characters), e.g. "Push", "Oberkörper A", "Beine"; the plan a short name for the split (at most 30 characters), e.g. "Push Pull Beine", "Ganzkörper 3×".`;

/** The muscle an exercise works most. */
const topMuscle = (muscles: Record<string, number>) =>
  Object.entries(muscles).reduce((top, entry) => (entry[1] > top[1] ? entry : top))[0];
const FOCUS_PICKS = 6;

/**
 * For each focus muscle, the usable exercises it leads: those that take weight first (they can be
 * progressed, unlike a fire hydrant), then the ones that work it most. So the model sees rows,
 * not pulldowns, for the upper back, and the hip thrust for the glutes.
 */
function focusExercises(focus: string[], catalog: CatalogRow[]) {
  const loaded = (e: CatalogRow) => (e.measures.includes('weight') ? 1 : 0);
  return focus.map((muscle) => {
    const ids = catalog
      .filter((e) => topMuscle(e.muscles) === muscle)
      .sort((a, b) => loaded(b) - loaded(a) || b.muscles[muscle] - a.muscles[muscle])
      .slice(0, FOCUS_PICKS)
      .map((e) => e.id);
    return `- ${muscle}: ${ids.join(', ') || '–'}`;
  });
}

/** The main muscles of an exercise, most worked first. */
const mainMuscles = (muscles: Record<string, number>) =>
  Object.entries(muscles)
    .filter(([, share]) => share >= 0.2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([muscle]) => muscle)
    .join(', ');

/**
 * The answers and the usable catalog as the model reads them; `have` is the user's equipment
 * (equipmentOf).
 */
export function contextText(
  answers: PlanAnswers,
  have: Set<string>,
  catalog: CatalogRow[],
  language: string,
) {
  const lines = catalog.map((e) => {
    const names = catalogNames(e.name, language);
    return `${e.id} | ${names} | ${e.equipment} | ${mainMuscles(e.muscles)}`;
  });
  return [
    `App language: ${language}.`,
    `Goal: ${answers.goal}.`,
    `Experience: ${answers.experience ?? 'unknown'}.`,
    `Workouts a week: ${answers.sessionsPerWeek}.`,
    `Split: ${answers.split ?? 'not picked'}.`,
    `Session length: ${answers.sessionMinutes} minutes.`,
    `Focus: ${answers.focus.length ? answers.focus.join(', ') : 'none'}.`,
    answers.equipment === 'gym'
      ? 'Equipment: a full gym.'
      : `Equipment: ${have.size ? [...have].join(', ') : 'none, only the floor'} (training at home).`,
    ...(answers.focus.length
      ? ['', 'Focus exercises:', ...focusExercises(answers.focus, catalog)]
      : []),
    '',
    'Catalog (id | names | equipment | main muscles):',
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
    required: ['name', 'routines'],
    properties: {
      name: { type: 'string' },
      routines: {
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

/** A routine of the model's answer, forced by `buildSchema`. */
export interface ModelRoutine {
  name: string;
  exercises: ModelExercise[];
}

const MIN_SETS = 1;
const MAX_SETS = 6;
/** A routine keeps at least this many exercises, even past its time. */
const MIN_EXERCISES = 2;
const MAX_EXERCISES = 10;
/** How far past the session length a routine may run before it takes no further exercises. */
const TIME_SLACK = 1.1;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(Number.isFinite(value) ? value : min)));

/**
 * Turns the model's answer into the app's plan, part by part as it streams in. Routines past the
 * workouts a week are dropped. A routine leaves out repeated exercises and, once it has its
 * first two, those that would take it past the session length.
 * Sets, targets, RIR and rest are kept in sensible ranges.
 */
export function planBuilder(answers: PlanAnswers, catalog: CatalogRow[]) {
  const byId = new Map(catalog.map((e) => [e.id, e]));
  const budget = answers.sessionMinutes * 60 * TIME_SLACK;
  let routineIndex = -1;
  let used = new Set<string>();
  let seconds = 0;

  return {
    /** The next routine, or null once there is one for every workout a week. */
    routine: (routine: Omit<ModelRoutine, 'exercises'>): ImportedRoutine | null => {
      routineIndex++;
      used = new Set();
      seconds = 0;
      if (routineIndex >= answers.sessionsPerWeek) return null;
      return { name: cut(routine.name, 24) || `${routineIndex + 1}` };
    },

    /** The exercise for the current routine, or null when the routine leaves it out. */
    exercise: (line: ModelExercise): PlanExercise | null => {
      const row = byId.get(line.exercise_id);
      if (!row || routineIndex >= answers.sessionsPerWeek || used.has(row.id)) return null;
      if (used.size >= MAX_EXERCISES) return null;
      const sets = clamp(line.sets, MIN_SETS, MAX_SETS);
      const rest = clamp(line.rest_seconds, 30, 300);
      const takes = EXERCISE_SECONDS + sets * (SET_SECONDS + rest);
      if (used.size >= MIN_EXERCISES && seconds + takes > budget) return null;
      used.add(row.id);
      seconds += takes;
      let min = clamp(line.target_min, 1, 30);
      let max = clamp(line.target_max, 1, 30);
      if (min > max) [min, max] = [max, min];
      const rir = line.rir == null ? null : clamp(line.rir, 0, 4);
      return {
        exercise: {
          exerciseId: row.id,
          sets: Array.from({ length: sets }, () => ({ targetMin: min, targetMax: max, rir })),
          restSeconds: rest,
        },
      };
    },
  };
}
