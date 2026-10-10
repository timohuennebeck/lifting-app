import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  inArray,
  isNotNull,
  isNull,
  lt,
  ne,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import { alias, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';

import type { SetValues } from '@/shared/lib/format';
import { getOrInsert } from '@/shared/lib/map';

import {
  bodyweightExerciseIds,
  defaultTargets,
  exerciseIdsWithout,
  isBodyweight,
  type SetTargets,
} from './exercises';
import { newId, nowIso } from './json';
import type { PlanExerciseDraft } from './templates';
import { nextPosition } from './positions';
import { drizzle, type Executor, type Tx } from './powersync/database';
import {
  templateExercises,
  templateSets,
  workoutExercises,
  workouts,
  workoutSets,
} from './powersync/schema';
import { queryKeys } from './query-keys';
import { type RowOf, useDrizzleQuery } from './use-drizzle-query';

/** Epley estimated one-rep max. */
const estimateOneRepMax = (kg: number, reps: number) => kg * (1 + reps / 30);

/**
 * Body weight assumed for bodyweight exercises logged with weight, where the logged weight is
 * only the added load: without it a pull-up at 0 kg would score 0 whatever the reps.
 */
const BODYWEIGHT_KG = 75;

/**
 * How good a set is, for PRs and top sets: estimated 1RM for weight × reps, most reps without
 * weight, longest hold for seconds (times the weight for weighted holds). An exercise logs the
 * same measures in every set, so scores of one exercise compare like with like.
 */
export function setScore({ weightKg, reps, seconds }: SetValues, exerciseId: string) {
  if (seconds != null) return weightKg != null ? weightKg * seconds : seconds;
  if (reps == null) return 0;
  if (weightKg == null) return reps;
  return estimateOneRepMax(weightKg + (isBodyweight(exerciseId) ? BODYWEIGHT_KG : 0), reps);
}

/**
 * Whether a completed set counts for history and records. "Mark as done" completes the sets of
 * a weighted exercise without weight when it was never logged; those only count as done sets.
 */
export const hasKnownWeight = (
  set: { weight_kg: AnySQLiteColumn },
  exercise: { exercise_id: AnySQLiteColumn },
) => or(isNotNull(set.weight_kg), inArray(exercise.exercise_id, exerciseIdsWithout('weight')));

/** `setScore` as SQL over `workout_sets` and `workout_exercises`, or aliases of them. */
export const setScoreSql = (
  set: Record<'weight_kg' | 'reps' | 'seconds', AnySQLiteColumn>,
  exercise: { exercise_id: AnySQLiteColumn },
) =>
  sql<number>`case
  when ${set.seconds} is not null then coalesce(${set.weight_kg}, 1) * ${set.seconds}
  when ${set.reps} is null then 0
  when ${set.weight_kg} is null then ${set.reps}
  else (${set.weight_kg} + case when ${inArray(exercise.exercise_id, bodyweightExerciseIds())}
    then ${BODYWEIGHT_KG} else 0 end) * (1 + ${set.reps} / 30.0) end`;

/** Aliases for correlated subqueries over the sets of other workouts. */
export const previousSet = alias(workoutSets, 'previous_set');
export const previousExercise = alias(workoutExercises, 'previous_exercise');

/** Subquery with the ids of a workout's exercises, for `inArray(…)`. */
const workoutExerciseIds = (workoutId: string) =>
  drizzle
    .select({ id: workoutExercises.id })
    .from(workoutExercises)
    .where(eq(workoutExercises.workout_id, workoutId));

/** Copies a template (or nothing, for an empty workout) into a new running workout. */
export async function startWorkout(userId: string, name: string, templateId: string | null) {
  return drizzle.transaction((tx) => insertWorkout(tx, userId, name, templateId));
}

/**
 * Starts a workout with exercises and target sets put together beforehand (an empty workout,
 * which isn't a template). Returns the new workout id.
 */
export async function startDraftWorkout(
  userId: string,
  name: string,
  exercises: PlanExerciseDraft[],
) {
  return drizzle.transaction(async (tx) => {
    const workoutId = await insertWorkout(tx, userId, name, null);
    for (const [position, exercise] of exercises.entries()) {
      const workoutExerciseId = newId();
      await tx.insert(workoutExercises).values({
        id: workoutExerciseId,
        user_id: userId,
        workout_id: workoutId,
        exercise_id: exercise.exerciseId,
        position,
        rest_seconds: exercise.restSeconds ?? null,
      });
      for (const [k, set] of exercise.sets.entries()) {
        await insertWorkoutSet(tx, userId, workoutExerciseId, k, {
          min: set.targetMin,
          max: set.targetMax,
          rir: set.rir,
        });
      }
    }
    return workoutId;
  });
}

/** `startWorkout` inside an existing transaction. Returns the new workout id. */
export async function insertWorkout(
  tx: Tx,
  userId: string,
  name: string,
  templateId: string | null,
) {
  const workoutId = newId();
  const now = nowIso();
  await tx.insert(workouts).values({
    id: workoutId,
    user_id: userId,
    template_id: templateId,
    name,
    started_at: now,
    created_at: now,
  });
  if (!templateId) return workoutId;
  const exercises = await tx.query.templateExercises.findMany({
    where: eq(templateExercises.template_id, templateId),
    orderBy: asc(templateExercises.position),
    with: { sets: { orderBy: asc(templateSets.position) } },
  });
  for (const te of exercises) {
    const workoutExerciseId = newId();
    await tx.insert(workoutExercises).values({
      id: workoutExerciseId,
      user_id: userId,
      workout_id: workoutId,
      exercise_id: te.exercise_id,
      position: te.position,
      rest_seconds: te.rest_seconds,
    });
    if (!te.sets.length) continue;
    // Template targets become the workout's empty sets.
    await tx.insert(workoutSets).values(
      te.sets.map((set) => ({
        id: newId(),
        user_id: userId,
        workout_exercise_id: workoutExerciseId,
        position: set.position,
        target_min: set.target_min,
        target_max: set.target_max,
        target_rir: set.rir,
        is_pr: false,
      })),
    );
  }
  return workoutId;
}

/** Inserts one empty set with the given targets (`drizzle` or a transaction). */
export async function insertWorkoutSet(
  executor: Executor,
  userId: string,
  workoutExerciseId: string,
  position: number,
  target: SetTargets,
) {
  await executor.insert(workoutSets).values({
    id: newId(),
    user_id: userId,
    workout_exercise_id: workoutExerciseId,
    position,
    target_min: target.min,
    target_max: target.max,
    target_rir: target.rir,
    is_pr: false,
  });
}

/** Sets of an exercise added to a running workout. */
const NEW_EXERCISE_SETS = 3;

/** Adds an exercise with empty sets at its default targets to a running workout. */
export async function addWorkoutExercise(userId: string, workoutId: string, exerciseId: string) {
  const target = defaultTargets(exerciseId);
  await drizzle.transaction(async (tx) => {
    const id = newId();
    await tx.insert(workoutExercises).values({
      id,
      user_id: userId,
      workout_id: workoutId,
      exercise_id: exerciseId,
      position: nextPosition(workoutExercises.position, eq(workoutExercises.workout_id, workoutId)),
      rest_seconds: null,
    });
    for (let i = 0; i < NEW_EXERCISE_SETS; i++) await insertWorkoutSet(tx, userId, id, i, target);
  });
}

/** Best set score for an exercise across all completed sets, excluding one set. */
async function bestScore(exerciseId: string, excludeSetId: string) {
  const [row] = await drizzle
    .select({ best: sql<number | null>`max(${setScoreSql(workoutSets, workoutExercises)})` })
    .from(workoutSets)
    .innerJoin(workoutExercises, eq(workoutExercises.id, workoutSets.workout_exercise_id))
    .where(
      and(
        eq(workoutExercises.exercise_id, exerciseId),
        isNotNull(workoutSets.completed_at),
        hasKnownWeight(workoutSets, workoutExercises),
        ne(workoutSets.id, excludeSetId),
      ),
    );
  return row?.best ?? 0;
}

/** Completes (or re-edits) a set. Returns true when it is a new personal record. */
export async function logSet(setId: string, exerciseId: string, values: SetValues) {
  const best = await bestScore(exerciseId, setId);
  const isPr = best > 0 && setScore(values, exerciseId) > best + 0.01;
  await drizzle
    .update(workoutSets)
    .set({
      weight_kg: values.weightKg,
      reps: values.reps,
      seconds: values.seconds,
      is_pr: isPr,
      // A re-edit keeps the original completion time.
      completed_at: sql`coalesce(${workoutSets.completed_at}, ${nowIso()})`,
    })
    .where(eq(workoutSets.id, setId));
  return isPr;
}

export async function finishWorkout(workoutId: string) {
  await drizzle.transaction(async (tx) => {
    // Unlogged sets are dropped so history only holds real work.
    await tx
      .delete(workoutSets)
      .where(
        and(
          isNull(workoutSets.completed_at),
          inArray(workoutSets.workout_exercise_id, workoutExerciseIds(workoutId)),
        ),
      );
    await tx.update(workouts).set({ finished_at: nowIso() }).where(eq(workouts.id, workoutId));
  });
}

/** Local SQLite views have no FK cascades, so children are removed explicitly. */
export async function discardWorkout(workoutId: string) {
  await drizzle.transaction(async (tx) => {
    await tx
      .delete(workoutSets)
      .where(inArray(workoutSets.workout_exercise_id, workoutExerciseIds(workoutId)));
    await tx.delete(workoutExercises).where(eq(workoutExercises.workout_id, workoutId));
    await tx.delete(workouts).where(eq(workouts.id, workoutId));
  });
}

export interface WorkoutSet extends SetValues {
  id: string;
  position: number;
  /** Reps, or seconds for timed exercises. */
  targetMin: number | null;
  targetMax: number | null;
  targetRir: number | null;
  completedAt: string | null;
  isPr: boolean;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  restSeconds: number | null;
  sets: WorkoutSet[];
}

export interface WorkoutDetail {
  id: string;
  name: string;
  startedAt: string;
  finishedAt: string | null;
  exercises: WorkoutExercise[];
}

/** One workout with its exercises and their sets, each ordered by position. */
const workoutDetailQuery = (workoutId: string) =>
  drizzle.query.workouts.findMany({
    columns: { id: true, name: true, started_at: true, finished_at: true },
    where: eq(workouts.id, workoutId),
    with: {
      exercises: {
        columns: { id: true, exercise_id: true, rest_seconds: true },
        orderBy: asc(workoutExercises.position),
        with: {
          sets: {
            columns: { user_id: false, workout_exercise_id: false },
            orderBy: asc(workoutSets.position),
          },
        },
      },
    },
  });

type WorkoutDetailRow = RowOf<typeof workoutDetailQuery>;

const toWorkoutSet = (s: WorkoutDetailRow['exercises'][number]['sets'][number]): WorkoutSet => ({
  id: s.id,
  position: s.position,
  targetMin: s.target_min,
  targetMax: s.target_max,
  targetRir: s.target_rir,
  weightKg: s.weight_kg,
  reps: s.reps,
  seconds: s.seconds,
  completedAt: s.completed_at,
  isPr: s.is_pr,
});

function toDetail([w]: WorkoutDetailRow[]): WorkoutDetail | null {
  if (!w) return null;
  return {
    id: w.id,
    name: w.name,
    startedAt: w.started_at,
    finishedAt: w.finished_at,
    exercises: w.exercises.map((e) => ({
      id: e.id,
      exerciseId: e.exercise_id,
      restSeconds: e.rest_seconds,
      sets: e.sets.map(toWorkoutSet),
    })),
  };
}

export function useWorkout(workoutId: string | undefined) {
  return useDrizzleQuery({
    queryKey: queryKeys.workouts.detail(workoutId ?? '').queryKey,
    enabled: !!workoutId,
    query: workoutDetailQuery(workoutId ?? ''),
    map: toDetail,
  });
}

const activeWorkoutQuery = () =>
  drizzle
    .select({ id: workouts.id, name: workouts.name, started_at: workouts.started_at })
    .from(workouts)
    .where(isNull(workouts.finished_at))
    .orderBy(desc(workouts.started_at))
    .limit(1);

const firstActive = (rows: RowOf<typeof activeWorkoutQuery>[]) => rows[0] ?? null;

/** The running (unfinished) workout, if any. */
export function useActiveWorkout() {
  return useDrizzleQuery({
    queryKey: queryKeys.workouts.active.queryKey,
    query: activeWorkoutQuery(),
    map: firstActive,
  });
}

/** Id of the running workout, read once (for event handlers). */
export async function getActiveWorkoutId() {
  const [row] = await activeWorkoutQuery();
  return row?.id ?? null;
}

export interface WorkoutSummary {
  id: string;
  name: string;
  startedAt: string;
  finishedAt: string;
  volumeKg: number;
  setCount: number;
  prCount: number;
  /** Exercise ids with completed set counts, for muscle shares. */
  items: { exerciseId: string; sets: number }[];
}

/** Finished workouts matching `where`, one row per exercise with its completed-set stats. */
const workoutSummaryQuery = (where?: SQL) =>
  drizzle
    .select({
      id: workouts.id,
      name: workouts.name,
      started_at: workouts.started_at,
      finished_at: workouts.finished_at,
      exercise_id: workoutExercises.exercise_id,
      sets: count(workoutSets.id),
      volume: sql<number>`coalesce(sum(${workoutSets.weight_kg} * ${workoutSets.reps}), 0)`,
      prs: sql<number>`coalesce(sum(${workoutSets.is_pr}), 0)`,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workout_id, workouts.id))
    .leftJoin(
      workoutSets,
      and(
        eq(workoutSets.workout_exercise_id, workoutExercises.id),
        isNotNull(workoutSets.completed_at),
      ),
    )
    .where(and(isNotNull(workouts.finished_at), where))
    .groupBy(workouts.id, workoutExercises.id)
    .orderBy(desc(workouts.started_at), workoutExercises.position);

function toSummaries(rows: RowOf<typeof workoutSummaryQuery>[]): WorkoutSummary[] {
  const map = new Map<string, WorkoutSummary>();
  for (const r of rows) {
    const w = getOrInsert(map, r.id, () => ({
      id: r.id,
      name: r.name,
      startedAt: r.started_at,
      // The query only returns finished workouts.
      finishedAt: r.finished_at!,
      volumeKg: 0,
      setCount: 0,
      prCount: 0,
      items: [],
    }));
    if (!r.exercise_id) continue;
    w.items.push({ exerciseId: r.exercise_id, sets: r.sets });
    w.volumeKg += r.volume;
    w.setCount += r.sets;
    w.prCount += r.prs;
  }
  return [...map.values()];
}

/** Finished workouts that started within [from, to). */
export function useWorkoutsInRange(fromIso: string, toIso: string) {
  return useDrizzleQuery({
    queryKey: queryKeys.workouts.range(fromIso, toIso).queryKey,
    query: workoutSummaryQuery(
      and(gte(workouts.started_at, fromIso), lt(workouts.started_at, toIso)),
    ),
    map: toSummaries,
  });
}

/** The latest `limit` finished workouts, newest first; a larger limit keeps the list shown. */
export function useWorkoutHistory(limit: number) {
  const latest = drizzle
    .select({ id: workouts.id })
    .from(workouts)
    .where(isNotNull(workouts.finished_at))
    .orderBy(desc(workouts.started_at))
    .limit(limit);
  return useDrizzleQuery({
    queryKey: queryKeys.workouts.history(limit).queryKey,
    query: workoutSummaryQuery(inArray(workouts.id, latest)),
    map: toSummaries,
    keepPrevious: true,
  });
}

const workoutCountQuery = () =>
  drizzle.select({ count: count() }).from(workouts).where(isNotNull(workouts.finished_at));

const firstCount = (rows: RowOf<typeof workoutCountQuery>[]) => rows[0]?.count ?? 0;

/** Number of finished workouts. */
export function useWorkoutCount() {
  return useDrizzleQuery({
    queryKey: queryKeys.workouts.count.queryKey,
    query: workoutCountQuery(),
    map: firstCount,
  });
}

export interface ExerciseHistorySet extends SetValues {
  rir: number | null;
  isPr: boolean;
}

export interface ExerciseHistoryEntry {
  workoutId: string;
  /** Workout name. */
  name: string;
  startedAt: string;
  finishedAt: string | null;
  sets: ExerciseHistorySet[];
  /** Best set by `setScore`. */
  topSet: ExerciseHistorySet;
  volumeKg: number;
  hasPr: boolean;
}

const exerciseHistoryQuery = (exerciseId: string) =>
  drizzle
    .select({
      workout_id: workouts.id,
      name: workouts.name,
      started_at: workouts.started_at,
      finished_at: workouts.finished_at,
      exercise_id: workoutExercises.exercise_id,
      weight_kg: workoutSets.weight_kg,
      reps: workoutSets.reps,
      seconds: workoutSets.seconds,
      target_rir: workoutSets.target_rir,
      is_pr: workoutSets.is_pr,
    })
    .from(workoutSets)
    .innerJoin(workoutExercises, eq(workoutExercises.id, workoutSets.workout_exercise_id))
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workout_id))
    .where(
      and(
        eq(workoutExercises.exercise_id, exerciseId),
        isNotNull(workoutSets.completed_at),
        isNotNull(workouts.finished_at),
        hasKnownWeight(workoutSets, workoutExercises),
      ),
    )
    .orderBy(desc(workouts.started_at), workoutExercises.position, workoutSets.position);

function toExerciseHistory(rows: RowOf<typeof exerciseHistoryQuery>[]): ExerciseHistoryEntry[] {
  const map = new Map<string, Omit<ExerciseHistoryEntry, 'topSet' | 'volumeKg' | 'hasPr'>>();
  for (const r of rows) {
    getOrInsert(map, r.workout_id, () => ({
      workoutId: r.workout_id,
      name: r.name,
      startedAt: r.started_at,
      finishedAt: r.finished_at,
      sets: [],
    })).sets.push({
      weightKg: r.weight_kg,
      reps: r.reps,
      seconds: r.seconds,
      rir: r.target_rir,
      isPr: r.is_pr,
    });
  }
  // All rows are sets of the same exercise.
  const exerciseId = rows[0]?.exercise_id ?? '';
  return [...map.values()].map((entry) => ({
    ...entry,
    topSet: entry.sets.reduce((top, set) =>
      setScore(set, exerciseId) > setScore(top, exerciseId) ? set : top,
    ),
    volumeKg: entry.sets.reduce((sum, s) => sum + (s.weightKg ?? 0) * (s.reps ?? 0), 0),
    hasPr: entry.sets.some((s) => s.isPr),
  }));
}

/** Completed sets of one exercise from finished workouts, newest first. */
export function useExerciseHistory(exerciseId: string | undefined) {
  return useDrizzleQuery({
    queryKey: queryKeys.workouts.exerciseHistory(exerciseId ?? '').queryKey,
    enabled: !!exerciseId,
    query: exerciseHistoryQuery(exerciseId ?? ''),
    map: toExerciseHistory,
  });
}

const muscleVolumeQuery = (sinceIso: string) =>
  drizzle
    .select({
      exercise_id: workoutExercises.exercise_id,
      started_at: workouts.started_at,
      sets: count(workoutSets.id),
    })
    .from(workoutSets)
    .innerJoin(workoutExercises, eq(workoutExercises.id, workoutSets.workout_exercise_id))
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workout_id))
    .where(and(isNotNull(workoutSets.completed_at), gte(workouts.started_at, sinceIso)))
    .groupBy(workouts.id, workoutExercises.exercise_id);

const toMuscleVolume = (rows: RowOf<typeof muscleVolumeQuery>[]) =>
  rows.map((r) => ({ exerciseId: r.exercise_id, startedAt: r.started_at, sets: r.sets }));

/** Completed set counts per exercise and workout since a date (Muscles tab). */
export function useMuscleVolume(sinceIso: string) {
  return useDrizzleQuery({
    queryKey: queryKeys.workouts.muscleVolume(sinceIso).queryKey,
    query: muscleVolumeQuery(sinceIso),
    map: toMuscleVolume,
  });
}
