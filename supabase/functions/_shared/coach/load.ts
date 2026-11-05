// Turns what the coach-chat function reads from the database into what the coach takes: the
// user's training (coach_history), the profile with its active plan, and the chat's earlier
// questions with the tool calls their answers came from. Plain TypeScript without Deno APIs.
import type { CoachCall, CoachTurn } from './chat.ts';
import { fits } from '../plan-events.ts';
import type { CatalogRow, EquipmentRow } from '../plans.ts';
import {
  type CoachCatalogExercise,
  type CoachData,
  type CoachExercise,
  type CoachRoutine,
  dayIn,
  type Measure,
  splitShares,
  type WorkoutLine,
} from './data.ts';
import type { CoachProfile } from './prompt.ts';

/** A set from coach_history: [weight_kg, reps, seconds, rir]. */
type SetRow = [number | null, number | null, number | null, number | null];

/** coach_history's answer (supabase/migrations/20261102130000_coach.sql). */
export interface HistoryRow {
  workouts: {
    name: string;
    started_at: string;
    finished_at: string;
    exercises: { exercise_id: string; sets: SetRow[] }[];
  }[];
  weights: [string, number][];
  checks: [string, number][];
  exercises: {
    id: string;
    name: Record<string, string>;
    measures: Measure[];
    muscles: Record<string, number>;
    equipment: string;
    assisted: boolean;
    cardio: boolean;
  }[];
  custom_exercises: {
    id: string;
    name: string;
    measures: Measure[];
    primary: string[];
    secondary: string[];
  }[];
}

const numberOrNull = (value: unknown) => (value == null ? null : Number(value));

/** The user's training, with exercise names in `language` (English when a catalog name lacks it). */
export function coachData(
  row: HistoryRow,
  language: string,
  timeZone: string,
  catalog: CoachCatalogExercise[] = [],
  routines: CoachRoutine[] = [],
): CoachData {
  const exercises = new Map<string, CoachExercise>();
  for (const x of row.exercises) {
    exercises.set(x.id, {
      id: x.id,
      name: x.name[language] ?? x.name.en ?? x.id,
      measures: x.measures,
      ...splitShares(x.muscles),
      bodyweight: x.equipment === 'bodyweight',
      assisted: x.assisted,
      cardio: x.cardio,
    });
  }
  for (const c of row.custom_exercises) {
    exercises.set(c.id, {
      id: c.id,
      name: c.name,
      measures: c.measures,
      primary: c.primary,
      secondary: c.secondary,
      bodyweight: false,
      assisted: false,
      cardio: false,
    });
  }
  return {
    exercises,
    catalog,
    routines,
    workouts: row.workouts.map((w) => ({
      name: w.name,
      startedAt: w.started_at,
      finishedAt: w.finished_at,
      exercises: w.exercises.map((e) => ({
        exerciseId: e.exercise_id,
        sets: e.sets.map(([weightKg, reps, seconds, rir]) => ({
          weightKg: numberOrNull(weightKg),
          reps: numberOrNull(reps),
          seconds: numberOrNull(seconds),
          rir: numberOrNull(rir),
        })),
      })),
    })),
    weights: row.weights.map(([date, kg]) => ({ date, kg: Number(kg) })),
    checks: row.checks.map(([at, score]) => ({ date: dayIn(at, timeZone), score: Number(score) })),
  };
}

export interface RoutineRow {
  id: string;
  name: string;
  plan_id: string | null;
  position: number;
  routine_exercises: {
    exercise_id: string;
    position: number;
    rest_seconds: number | null;
    routine_sets: {
      position: number;
      target_min: number | null;
      target_max: number | null;
      rir: number | null;
    }[];
  }[];
}

/** A finished workout of the active plan. */
export interface PlanWorkoutRow {
  routine_id: string | null;
  plan_week: number | null;
}

const byPosition = (a: { position: number }, b: { position: number }) => a.position - b.position;

/** An exercise with its sets as one line: the lowest target to the highest. */
function workoutLine(row: RoutineRow['routine_exercises'][number]): WorkoutLine {
  const sets = [...row.routine_sets].sort(byPosition);
  const lows = sets.flatMap((s) => s.target_min ?? s.target_max ?? []);
  const highs = sets.flatMap((s) => s.target_max ?? s.target_min ?? []);
  return {
    exerciseId: row.exercise_id,
    sets: sets.length,
    targetMin: lows.length ? Math.min(...lows) : null,
    targetMax: highs.length ? Math.max(...highs) : null,
    rir: sets.find((s) => s.rir != null)?.rir ?? null,
    restSeconds: row.rest_seconds,
  };
}

/** The routines a plan's latest week has done; none once that week has the weekly goal. */
function doneThisWeek(workouts: PlanWorkoutRow[], sessionsPerWeek: number) {
  const weeks = workouts.flatMap((w) => w.plan_week ?? []);
  if (!weeks.length) return new Set<string>();
  const latest = workouts.filter((w) => w.plan_week === Math.max(...weeks));
  if (latest.length >= sessionsPerWeek) return new Set<string>();
  return new Set(latest.flatMap((w) => w.routine_id ?? []));
}

/**
 * The active plan's routines in their order, then those outside a plan; other plans' are left out.
 * As on the Training tab, the first with exercises not done this plan week comes next.
 */
export function coachRoutines(
  rows: RoutineRow[],
  plan: { id: string; sessionsPerWeek: number } | null,
  planWorkouts: PlanWorkoutRow[],
): CoachRoutine[] {
  const done = plan ? doneThisWeek(planWorkouts, plan.sessionsPerWeek) : new Set<string>();
  const routine = (row: RoutineRow, status: CoachRoutine['status']): CoachRoutine => ({
    id: row.id,
    name: row.name,
    status,
    exercises: row.routine_exercises
      .filter((e) => e.routine_sets.length)
      .sort(byPosition)
      .map(workoutLine),
  });
  const sorted = [...rows].sort(byPosition);
  const inPlan = sorted
    .filter((r) => plan && r.plan_id === plan.id)
    .map((r) => routine(r, done.has(r.id) ? 'done' : 'open'));
  const next = inPlan.find((r) => r.status === 'open' && r.exercises.length);
  if (next) next.status = 'next';
  return [...inPlan, ...sorted.filter((r) => r.plan_id === null).map((r) => routine(r, null))];
}

export interface ProfileRow {
  birth_date: string | null;
  unit_preference: 'metric' | 'imperial';
  goal: string | null;
  experience: string | null;
  focus: string[] | null;
  equipment: string | null;
  home_equipment: string[] | null;
  active_plan_id: string | null;
  coach_consent_at: string | null;
}

/** The catalog without cardio, each exercise with whether the user's equipment allows it. */
export function coachCatalog(
  rows: CatalogRow[],
  equipment: EquipmentRow[],
  profile: Pick<ProfileRow, 'equipment' | 'home_equipment'>,
  language: string,
): CoachCatalogExercise[] {
  const have = new Set(
    profile.equipment === 'home'
      ? (profile.home_equipment ?? [])
      : profile.equipment === 'bodyweight'
        ? []
        : equipment.filter((e) => e.in_gym).map((e) => e.id),
  );
  return rows
    .filter((e) => !e.cardio)
    .map((e) => ({
      id: e.id,
      name: e.name[language] ?? e.name.en ?? e.id,
      equipment: e.equipment,
      measures: e.measures as Measure[],
      muscles: e.muscles,
      restSeconds: e.rest_seconds,
      usable: fits(e.needs, have),
    }));
}

export const coachProfile = (
  profile: ProfileRow,
  plan: { name: string; sessions_per_week: number } | null,
): CoachProfile => ({
  goal: profile.goal,
  experience: profile.experience,
  focus: profile.focus ?? [],
  equipment: profile.equipment,
  plan: plan ? { name: plan.name, sessionsPerWeek: plan.sessions_per_week } : null,
});

export interface MessageRow {
  id: string;
  role: 'user' | 'coach';
  content: string;
}

/**
 * The chat's questions with their answers, oldest first, from its messages (oldest first) and the
 * runs that wrote them: each answer's tool calls come from the run that saved it, without the
 * long lists of find_exercises.
 */
export function coachTurns(
  messages: MessageRow[],
  runs: { answer_id: string | null; calls: CoachCall[] | null }[],
): CoachTurn[] {
  const callsOf = new Map(runs.map((run) => [run.answer_id, run.calls ?? []]));
  const turns: CoachTurn[] = [];
  let question: string | null = null;
  for (const message of messages) {
    if (message.role === 'user') question = message.content;
    else if (question != null) {
      const calls = (callsOf.get(message.id) ?? []).filter((c) => c.name !== 'find_exercises');
      turns.push({ question, calls, answer: message.content });
      question = null;
    }
  }
  return turns;
}
