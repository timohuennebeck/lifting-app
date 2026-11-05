import {
  and,
  asc,
  count,
  eq,
  inArray,
  isNotNull,
  isNull,
  max,
  min,
  type SQL,
  sql,
} from 'drizzle-orm';

import { getOrInsert } from '@/shared/lib/map';

import { getExercise, swapTargets } from './exercises';
import { newId, nowIso } from './json';
import { nextPosition } from './positions';
import { drizzle, type Executor, type Tx } from './powersync/database';
import { plans, routineExercises, routines, routineSets, workoutEntries } from './powersync/schema';
import { queryKeys } from './query-keys';
import { type RowOf, useDrizzleQuery } from './use-drizzle-query';

/** Seconds a single working set takes, excluding rest. */
const SET_SECONDS = 45;
/** Setup, warm-up and transition time per exercise. */
const EXERCISE_SECONDS = 150;
export const DEFAULT_REST = 90;

export interface SetTarget {
  /** Reps, or seconds for timed exercises; either may be left out. */
  targetMin: number | null;
  targetMax: number | null;
  rir: number | null;
}

export interface ExerciseDraft {
  exerciseId: string;
  sets: SetTarget[];
  restSeconds: number | null;
}

export async function insertRoutineSets(
  tx: Tx,
  userId: string,
  routineExerciseId: string,
  sets: SetTarget[],
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
  exercise: ExerciseDraft,
) {
  const id = newId();
  await tx.insert(routineExercises).values({
    id,
    user_id: userId,
    routine_id: routineId,
    exercise_id: exercise.exerciseId,
    position,
    rest_seconds: exercise.restSeconds,
  });
  await insertRoutineSets(tx, userId, id, exercise.sets);
  return id;
}

/**
 * Puts exercise `to` in place of `from` in the routine exercises `routineExerciseIds`. Their sets
 * and rest stay; the targets reset only between reps and seconds (`swapTargets`).
 */
export async function swapInRoutines(
  tx: Tx,
  routineExerciseIds: string[],
  from: string,
  to: string,
) {
  await tx
    .update(routineExercises)
    .set({ exercise_id: to })
    .where(inArray(routineExercises.id, routineExerciseIds));
  const targets = swapTargets(from, to);
  if (targets) {
    await tx
      .update(routineSets)
      .set({ target_min: targets.min, target_max: targets.max, rir: targets.rir })
      .where(inArray(routineSets.routine_exercise_id, routineExerciseIds));
  }
}

/** Routines in a plan, or the library's (without a plan) for `null` (SQL `IS`). */
const inPlan = (planId: string | null) =>
  planId === null ? isNull(routines.plan_id) : eq(routines.plan_id, planId);

/**
 * Inserts an empty routine (`drizzle` or a transaction) at `position`, by default after the last
 * one of its plan, or of the library for `null`. Returns its id, a new one unless given.
 */
export async function insertRoutine(
  executor: Executor,
  userId: string,
  planId: string | null,
  name: string,
  position?: number,
  id: string = newId(),
) {
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

/** The reps a set aims for: the middle of its range, or the bound it has; null without one. */
export function repTarget({ targetMin, targetMax }: Pick<SetTarget, 'targetMin' | 'targetMax'>) {
  if (targetMin == null) return targetMax;
  if (targetMax == null) return targetMin;
  return (targetMin + targetMax) / 2;
}

/** The rep target of an exercise's heaviest set (the fewest reps), which its rest follows. */
export function heaviestRepTarget(sets: Pick<SetTarget, 'targetMin' | 'targetMax'>[]) {
  const targets = sets.flatMap((s) => repTarget(s) ?? []);
  return targets.length ? Math.min(...targets) : null;
}

/**
 * Rest after a set: the override, else the exercise's own rest, which is meant for 8 reps or
 * more. Heavier sets recover longer: a quarter more for 6–7 reps, half for 5 or fewer, in 15 s
 * steps. Without reps, and for timed exercises (their targets are seconds), the exercise's rest.
 */
export function restSecondsFor(
  exerciseId: string,
  override: number | null | undefined,
  reps?: number | null,
) {
  if (override != null) return override;
  const exercise = getExercise(exerciseId);
  const rest = exercise?.restSeconds ?? DEFAULT_REST;
  if (reps == null || exercise?.measures.includes('seconds')) return rest;
  const factor = reps <= 5 ? 1.5 : reps < 8 ? 1.25 : 1;
  return Math.round((rest * factor) / 15) * 15;
}

/** An exercise of a routine or workout with its set count, for the muscle shares and the time. */
export interface ExerciseItem {
  exerciseId: string;
  sets: number;
  /** The rest override; the exercise's own rest when null or left out. */
  restSeconds?: number | null;
  /** The rep target the rest follows (`heaviestRepTarget`); none when null or left out. */
  reps?: number | null;
}

/** Exercises as `estimateMinutes` and the muscle shares take them: set count and rest. */
export const exerciseItems = (exercises: ExerciseDraft[]): ExerciseItem[] =>
  exercises.map((e) => ({
    exerciseId: e.exerciseId,
    sets: e.sets.length,
    restSeconds: e.restSeconds ?? null,
    reps: heaviestRepTarget(e.sets),
  }));

/** Rough session length in minutes from sets and rest times. */
export function estimateMinutes(items: ExerciseItem[]) {
  const seconds = items.reduce(
    (sum, i) =>
      sum +
      EXERCISE_SECONDS +
      i.sets * (SET_SECONDS + restSecondsFor(i.exerciseId, i.restSeconds, i.reps)),
    0,
  );
  return Math.round(seconds / 60);
}

/** `repTarget` in SQL. */
const { target_min: low, target_max: high } = routineSets;
const setRepTarget = sql<number | null>`coalesce((${low} + ${high}) / 2.0, ${low}, ${high})`;

/**
 * One row per routine exercise (or per empty routine) with its set count and rep target. Both
 * are correlated subqueries: a LEFT JOIN of the sets through PowerSync's views reads all of them.
 */
const routineListQuery = () =>
  drizzle
    .select({
      id: routines.id,
      name: routines.name,
      plan_id: routines.plan_id,
      exercise_id: routineExercises.exercise_id,
      rest_seconds: routineExercises.rest_seconds,
      set_count: sql<number>`${drizzle
        .select({ count: count() })
        .from(routineSets)
        .where(eq(routineSets.routine_exercise_id, routineExercises.id))}`,
      // heaviestRepTarget in SQL: the smallest rep target of its sets.
      reps: sql<number | null>`${drizzle
        .select({ reps: min(setRepTarget) })
        .from(routineSets)
        .where(eq(routineSets.routine_exercise_id, routineExercises.id))}`,
    })
    .from(routines)
    .leftJoin(plans, eq(plans.id, routines.plan_id))
    .leftJoin(routineExercises, eq(routineExercises.routine_id, routines.id))
    .orderBy(plans.position, routines.position, routineExercises.position);

export interface RoutineSummary {
  id: string;
  name: string;
  planId: string | null;
  exerciseCount: number;
  estimatedMinutes: number;
  /** Exercise ids with set counts, rest overrides and rep targets: muscle shares and time. */
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
      estimatedMinutes: 0,
      items: [],
    }));
    if (!r.exercise_id) continue;
    t.items.push({
      exerciseId: r.exercise_id,
      sets: r.set_count,
      restSeconds: r.rest_seconds,
      reps: r.reps,
    });
    t.exerciseCount += 1;
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

const routineExerciseIdsQuery = () =>
  drizzle.selectDistinct({ exercise_id: routineExercises.exercise_id }).from(routineExercises);

const toExerciseIds = (rows: RowOf<typeof routineExerciseIdsQuery>[]) =>
  rows.flatMap((r) => (r.exercise_id ? [r.exercise_id] : []));

/** The exercises in any of the user's routines. */
export function useRoutineExerciseIds() {
  return useDrizzleQuery({
    queryKey: queryKeys.routines.exerciseIds.queryKey,
    query: routineExerciseIdsQuery(),
    map: toExerciseIds,
  });
}

/** When routines were done: the start of each one's latest finished workout, by routine id. */
const doneDatesQuery = () =>
  drizzle
    .select({ routine_id: workoutEntries.routine_id, started_at: max(workoutEntries.started_at) })
    .from(workoutEntries)
    .where(and(isNotNull(workoutEntries.routine_id), isNotNull(workoutEntries.finished_at)))
    .groupBy(workoutEntries.routine_id);

/** ISO start of the latest finished workout of each routine done, by routine id. */
export type DoneDates = Record<string, string>;

const toDoneDates = (rows: RowOf<typeof doneDatesQuery>[]): DoneDates =>
  Object.fromEntries(
    rows.flatMap((r) => (r.routine_id && r.started_at ? [[r.routine_id, r.started_at]] : [])),
  );

/** When each routine was last done. */
export function useLastDone() {
  return useDrizzleQuery({
    queryKey: queryKeys.routines.lastDone.queryKey,
    query: doneDatesQuery(),
    map: toDoneDates,
  });
}

interface RoutineSetDetail extends SetTarget {
  id: string;
}

interface RoutineExerciseDetail {
  id: string;
  exerciseId: string;
  restSeconds: number | null;
  sets: RoutineSetDetail[];
}

interface RoutineDetail {
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
