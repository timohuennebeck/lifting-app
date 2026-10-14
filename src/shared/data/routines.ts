import { and, asc, count, eq, isNull, type SQL } from 'drizzle-orm';

import { getOrInsert } from '@/shared/lib/map';

import { getExercise } from './exercises';
import { newId, nowIso } from './json';
import { nextPosition } from './positions';
import { drizzle, type Executor, type Tx } from './powersync/database';
import { plans, routineExercises, routines, routineSets } from './powersync/schema';
import { queryKeys } from './query-keys';
import { type RowOf, useDrizzleQuery } from './use-drizzle-query';

/** Seconds a single working set takes, excluding rest. */
const SET_SECONDS = 45;
/** Setup, warm-up and transition time per exercise. */
const EXERCISE_SECONDS = 150;
export const DEFAULT_REST = 90;

export interface PlanSetDraft {
  /** Reps, or seconds for timed exercises; either may be left out. */
  targetMin: number | null;
  targetMax: number | null;
  rir: number | null;
}

export interface PlanExerciseDraft {
  exerciseId: string;
  sets: PlanSetDraft[];
  restSeconds: number | null;
}

export async function insertRoutineSets(
  tx: Tx,
  userId: string,
  routineExerciseId: string,
  sets: PlanSetDraft[],
) {
  if (!sets.length) return;
  await tx.insert(routineSets).values(
    sets.map((set, position) => ({
      id: newId(),
      user_id: userId,
      routine_exercise_id: routineExerciseId,
      position,
      target_min: set.targetMin,
      target_max: set.targetMax,
      rir: set.rir,
    })),
  );
}

/** `position` may be a `nextPosition` subquery to append the exercise. */
export async function insertRoutineExercise(
  tx: Tx,
  userId: string,
  routineId: string,
  position: number | SQL<number>,
  exercise: PlanExerciseDraft,
) {
  const id = newId();
  await tx.insert(routineExercises).values({
    id,
    user_id: userId,
    routine_id: routineId,
    exercise_id: exercise.exerciseId,
    position,
    rest_seconds: exercise.restSeconds ?? null,
  });
  await insertRoutineSets(tx, userId, id, exercise.sets);
  return id;
}

/** Routines in a plan, or the library's (without a plan) for `null` (SQL `IS`). */
const inPlan = (planId: string | null) =>
  planId === null ? isNull(routines.plan_id) : eq(routines.plan_id, planId);

/**
 * Inserts an empty routine (`drizzle` or a transaction) at `position`, by default after the last
 * one of its plan, or of the library for `null`. Returns its id.
 */
export async function insertRoutine(
  executor: Executor,
  userId: string,
  planId: string | null,
  name: string,
  position?: number,
) {
  const id = newId();
  await executor.insert(routines).values({
    id,
    user_id: userId,
    plan_id: planId,
    name,
    position:
      position ??
      nextPosition(routines.position, and(eq(routines.user_id, userId), inPlan(planId))),
    created_at: nowIso(),
    updated_at: nowIso(),
  });
  return id;
}

export function restSecondsFor(exerciseId: string, override: number | null | undefined) {
  return override ?? getExercise(exerciseId)?.restSeconds ?? DEFAULT_REST;
}

/** An exercise of a routine or workout with its set count, for the muscle shares and the time. */
export interface ExerciseItem {
  exerciseId: string;
  sets: number;
  /** The rest override; the exercise's own rest when null or left out. */
  restSeconds?: number | null;
}

/** Exercises as `estimateMinutes` and the muscle shares take them: set count and rest. */
export const exerciseItems = (exercises: PlanExerciseDraft[]): ExerciseItem[] =>
  exercises.map((e) => ({
    exerciseId: e.exerciseId,
    sets: e.sets.length,
    restSeconds: e.restSeconds ?? null,
  }));

/** Rough session length in minutes from sets and rest times. */
export function estimateMinutes(items: ExerciseItem[]) {
  const seconds = items.reduce(
    (sum, i) =>
      sum + EXERCISE_SECONDS + i.sets * (SET_SECONDS + restSecondsFor(i.exerciseId, i.restSeconds)),
    0,
  );
  return Math.round(seconds / 60);
}

/** One row per routine exercise (or per empty routine) with its set count. */
const routineListQuery = () =>
  drizzle
    .select({
      id: routines.id,
      name: routines.name,
      plan_id: routines.plan_id,
      exercise_id: routineExercises.exercise_id,
      rest_seconds: routineExercises.rest_seconds,
      set_count: count(routineSets.id),
    })
    .from(routines)
    .leftJoin(plans, eq(plans.id, routines.plan_id))
    .leftJoin(routineExercises, eq(routineExercises.routine_id, routines.id))
    .leftJoin(routineSets, eq(routineSets.routine_exercise_id, routineExercises.id))
    .groupBy(routines.id, routineExercises.id)
    .orderBy(plans.position, routines.position, routineExercises.position);

export interface RoutineSummary {
  id: string;
  name: string;
  planId: string | null;
  exerciseCount: number;
  setCount: number;
  estimatedMinutes: number;
  /** Exercise ids with their set counts and rest overrides, for muscle shares and the time. */
  items: ExerciseItem[];
}

function summarize(rows: RowOf<typeof routineListQuery>[]): RoutineSummary[] {
  const byId = new Map<string, RoutineSummary>();
  for (const r of rows) {
    const t = getOrInsert(byId, r.id, () => ({
      id: r.id,
      name: r.name,
      planId: r.plan_id,
      exerciseCount: 0,
      setCount: 0,
      estimatedMinutes: 0,
      items: [],
    }));
    if (!r.exercise_id) continue;
    t.items.push({ exerciseId: r.exercise_id, sets: r.set_count, restSeconds: r.rest_seconds });
    t.exerciseCount += 1;
    t.setCount += r.set_count;
  }
  return [...byId.values()].map((t) => ({ ...t, estimatedMinutes: estimateMinutes(t.items) }));
}

/** All routines with their plan and size stats: the library's first, then each plan's in order. */
export function useRoutines() {
  return useDrizzleQuery({
    queryKey: queryKeys.routines.list.queryKey,
    query: routineListQuery(),
    map: summarize,
  });
}

export interface RoutineSetDetail extends PlanSetDraft {
  id: string;
}

export interface RoutineExerciseDetail {
  id: string;
  exerciseId: string;
  restSeconds: number | null;
  sets: RoutineSetDetail[];
}

export interface RoutineDetail {
  id: string;
  name: string;
  planId: string | null;
  exercises: RoutineExerciseDetail[];
}

/** One routine with its exercises and their sets, each ordered by position. */
const routineDetailQuery = (routineId: string) =>
  drizzle.query.routines.findMany({
    columns: { id: true, name: true, plan_id: true },
    where: eq(routines.id, routineId),
    with: {
      exercises: {
        columns: { id: true, exercise_id: true, rest_seconds: true },
        orderBy: asc(routineExercises.position),
        with: {
          sets: {
            columns: { id: true, target_min: true, target_max: true, rir: true },
            orderBy: asc(routineSets.position),
          },
        },
      },
    },
  });

function toRoutineDetail([t]: RowOf<typeof routineDetailQuery>[]): RoutineDetail | null {
  if (!t) return null;
  return {
    id: t.id,
    name: t.name,
    planId: t.plan_id,
    exercises: t.exercises.map((e) => ({
      id: e.id,
      exerciseId: e.exercise_id,
      restSeconds: e.rest_seconds,
      sets: e.sets.map((set) => ({
        id: set.id,
        targetMin: set.target_min,
        targetMax: set.target_max,
        rir: set.rir,
      })),
    })),
  };
}

/** Keeps the previous routine while another one loads. */
export function useRoutineDetail(routineId: string | undefined) {
  return useDrizzleQuery({
    queryKey: queryKeys.routines.detail(routineId ?? '').queryKey,
    enabled: !!routineId,
    query: routineDetailQuery(routineId ?? ''),
    map: toRoutineDetail,
    keepPrevious: true,
  });
}
