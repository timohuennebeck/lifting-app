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
import { DEFAULT_BODY_WEIGHT_KG } from '@/shared/lib/body-weight';

import {
  assistedExerciseIds,
  bodyweightExerciseIds,
  exerciseIdsWithout,
  isAssisted,
  newExerciseDraft,
  type SetTargets,
} from './exercises';
import { newId, nowIso } from './json';
import { nextPosition } from './positions';
import { drizzle, type Executor, type Tx } from './powersync/database';
import { blockWeekOf, currentPlanWeek, setsForWeek } from './plans';
import {
  plans,
  routineExercises,
  routines,
  routineSets,
  weightEntries,
  workoutEntries,
  workoutEntriesExercises,
  workoutEntriesSets,
} from './powersync/schema';
import { queryKeys } from './query-keys';
import type { ExerciseItem, PlanExerciseDraft } from './routines';
import { firstCount, type RowOf, useDrizzleQuery } from './use-drizzle-query';

/**
 * The user's latest body weight, for bodyweight and assisted sets where the logged weight is
 * only the added load or the assistance: without it a pull-up at 0 kg would score 0 whatever the
 * reps. The device only holds the user's own weight entries.
 */
const bodyweightSql = sql<number>`coalesce((select ${weightEntries.weight_kg} from ${weightEntries} order by ${weightEntries.date} desc limit 1), ${DEFAULT_BODY_WEIGHT_KG})`;

/**
 * Whether a completed set counts for history and records. "Mark as done" completes the sets of
 * a weighted exercise without weight when it was never logged; those only count as done sets.
 */
export const hasKnownWeight = (
  set: { weight_kg: AnySQLiteColumn },
  exercise: { exercise_id: AnySQLiteColumn },
) => or(isNotNull(set.weight_kg), inArray(exercise.exercise_id, exerciseIdsWithout('weight')));

type Operand = AnySQLiteColumn | SQL;

/**
 * How good a set is, for PRs and top sets, over `workout_entries_sets` and
 * `workout_entries_exercises` (or aliases of them, or values): the Epley estimated 1RM of the load
 * for weight × reps (the body weight plus the added weight, or minus the assistance), most reps
 * without weight, the longest hold for seconds (times the weight for weighted holds). An exercise
 * logs the same measures in every set, so scores of one exercise compare like with like.
 */
export function setScoreSql(
  set: Record<'weight_kg' | 'reps' | 'seconds', Operand>,
  exercise: { exercise_id: Operand },
) {
  const exerciseId = sql`${exercise.exercise_id}`;
  return sql<number>`case
  when ${set.seconds} is not null then coalesce(${set.weight_kg}, 1) * ${set.seconds}
  when ${set.reps} is null then 0
  when ${set.weight_kg} is null then ${set.reps}
  else (case
    when ${inArray(exerciseId, bodyweightExerciseIds())} then ${bodyweightSql} + ${set.weight_kg}
    when ${inArray(exerciseId, assistedExerciseIds())} then max(${bodyweightSql} - ${set.weight_kg}, 0)
    else ${set.weight_kg} end) * (1 + ${set.reps} / 30.0) end`;
}

/** Aliases for correlated subqueries over the sets of other workouts. */
export const previousSet = alias(workoutEntriesSets, 'previous_set');
export const previousExercise = alias(workoutEntriesExercises, 'previous_exercise');

/** Subquery with the ids of a workout's exercises, for `inArray(…)`. */
const workoutExerciseIds = (workoutId: string) =>
  drizzle
    .select({ id: workoutEntriesExercises.id })
    .from(workoutEntriesExercises)
    .where(eq(workoutEntriesExercises.workout_entries_id, workoutId));

/** Copies a routine into a new running workout (an empty one starts with `startDraftWorkout`). */
export async function startWorkout(userId: string, name: string, routineId: string) {
  return drizzle.transaction((tx) => insertWorkout(tx, userId, name, routineId));
}

/**
 * Starts a workout with exercises and target sets put together beforehand (an empty workout,
 * which isn't a routine). Returns the new workout id.
 */
export async function startDraftWorkout(
  userId: string,
  name: string,
  exercises: PlanExerciseDraft[],
) {
  return drizzle.transaction(async (tx) => {
    const workoutId = await insertWorkout(tx, userId, name, null);
    for (const [position, exercise] of exercises.entries()) {
      await insertWorkoutExercise(tx, userId, workoutId, position, exercise);
    }
    return workoutId;
  });
}

/** The plan of a routine, if it has one, with its week and block settings. */
async function planOf(tx: Tx, routineId: string) {
  const row = await tx
    .select({
      id: plans.id,
      sessionsPerWeek: plans.sessions_per_week,
      blockWeeks: plans.block_weeks,
      blockStartWeek: plans.block_start_week,
    })
    .from(routines)
    .innerJoin(plans, eq(plans.id, routines.plan_id))
    .where(eq(routines.id, routineId))
    .get();
  return row ?? null;
}

/**
 * `startWorkout` inside an existing transaction. Returns the new workout id. A routine of a plan
 * counts for the plan's current week, and its sets get that week's targets (see `setsForWeek`).
 */
export async function insertWorkout(
  tx: Tx,
  userId: string,
  name: string,
  routineId: string | null,
) {
  const workoutId = newId();
  const now = nowIso();
  const plan = routineId ? await planOf(tx, routineId) : null;
  // Before the insert, which would count itself.
  const planWeek = plan ? await currentPlanWeek(tx, plan.id, plan.sessionsPerWeek) : null;
  await tx.insert(workoutEntries).values({
    id: workoutId,
    user_id: userId,
    routine_id: routineId,
    plan_id: plan?.id ?? null,
    plan_week: planWeek,
    name,
    started_at: now,
    created_at: now,
  });
  if (!routineId) return workoutId;
  const blockWeek = plan && planWeek ? blockWeekOf(planWeek, plan) : null;
  const exercises = await tx.query.routineExercises.findMany({
    where: eq(routineExercises.routine_id, routineId),
    orderBy: asc(routineExercises.position),
    with: { sets: { orderBy: asc(routineSets.position) } },
  });
  for (const te of exercises) {
    const workoutExerciseId = newId();
    await tx.insert(workoutEntriesExercises).values({
      id: workoutExerciseId,
      user_id: userId,
      workout_entries_id: workoutId,
      exercise_id: te.exercise_id,
      position: te.position,
      rest_seconds: te.rest_seconds,
    });
    const sets = setsForWeek(te.sets, blockWeek, { blockWeeks: plan?.blockWeeks ?? null });
    if (!sets.length) continue;
    // The routine's targets for this week become the workout's empty sets.
    await tx.insert(workoutEntriesSets).values(
      sets.map((set) => ({
        id: newId(),
        user_id: userId,
        workout_entries_exercise_id: workoutExerciseId,
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
  await executor.insert(workoutEntriesSets).values({
    id: newId(),
    user_id: userId,
    workout_entries_exercise_id: workoutExerciseId,
    position,
    target_min: target.min,
    target_max: target.max,
    target_rir: target.rir,
    is_pr: false,
  });
}

/** Adds an exercise with one empty set per target; `position` may be a `nextPosition` subquery. */
async function insertWorkoutExercise(
  tx: Tx,
  userId: string,
  workoutId: string,
  position: number | SQL<number>,
  exercise: PlanExerciseDraft,
) {
  const id = newId();
  await tx.insert(workoutEntriesExercises).values({
    id,
    user_id: userId,
    workout_entries_id: workoutId,
    exercise_id: exercise.exerciseId,
    position,
    rest_seconds: exercise.restSeconds ?? null,
  });
  for (const [k, set] of exercise.sets.entries()) {
    await insertWorkoutSet(tx, userId, id, k, {
      min: set.targetMin,
      max: set.targetMax,
      rir: set.rir,
    });
  }
}

/** Appends an exercise with empty sets at its default targets to a running workout. */
export async function addWorkoutExercise(userId: string, workoutId: string, exerciseId: string) {
  await drizzle.transaction((tx) =>
    insertWorkoutExercise(
      tx,
      userId,
      workoutId,
      nextPosition(
        workoutEntriesExercises.position,
        eq(workoutEntriesExercises.workout_entries_id, workoutId),
      ),
      newExerciseDraft(exerciseId),
    ),
  );
}

/** Whether `values` beat every other completed set of the exercise; the first set never does. */
async function isRecord(setId: string, exerciseId: string, values: SetValues) {
  const logged = {
    weight_kg: sql`${values.weightKg}`,
    reps: sql`${values.reps}`,
    seconds: sql`${values.seconds}`,
  };
  const [row] = await drizzle
    .select({
      best: sql<number | null>`max(${setScoreSql(workoutEntriesSets, workoutEntriesExercises)})`,
      score: setScoreSql(logged, { exercise_id: sql`${exerciseId}` }),
    })
    .from(workoutEntriesSets)
    .innerJoin(
      workoutEntriesExercises,
      eq(workoutEntriesExercises.id, workoutEntriesSets.workout_entries_exercise_id),
    )
    .where(
      and(
        eq(workoutEntriesExercises.exercise_id, exerciseId),
        isNotNull(workoutEntriesSets.completed_at),
        hasKnownWeight(workoutEntriesSets, workoutEntriesExercises),
        ne(workoutEntriesSets.id, setId),
      ),
    );
  return !!row?.best && row.score > row.best + 0.01;
}

/** Completes (or re-edits) a set. Returns true when it is a new personal record. */
export async function logSet(setId: string, exerciseId: string, values: SetValues) {
  const isPr = await isRecord(setId, exerciseId, values);
  await drizzle
    .update(workoutEntriesSets)
    .set({
      weight_kg: values.weightKg,
      reps: values.reps,
      seconds: values.seconds,
      is_pr: isPr,
      // A re-edit keeps the original completion time.
      completed_at: sql`coalesce(${workoutEntriesSets.completed_at}, ${nowIso()})`,
    })
    .where(eq(workoutEntriesSets.id, setId));
  return isPr;
}

export async function finishWorkout(workoutId: string) {
  await drizzle.transaction(async (tx) => {
    // Unlogged sets are dropped so history only holds real work.
    await tx
      .delete(workoutEntriesSets)
      .where(
        and(
          isNull(workoutEntriesSets.completed_at),
          inArray(workoutEntriesSets.workout_entries_exercise_id, workoutExerciseIds(workoutId)),
        ),
      );
    await tx
      .update(workoutEntries)
      .set({ finished_at: nowIso() })
      .where(eq(workoutEntries.id, workoutId));
  });
}

/** Local SQLite views have no FK cascades, so children are removed explicitly. */
export async function discardWorkout(workoutId: string) {
  await drizzle.transaction(async (tx) => {
    await tx
      .delete(workoutEntriesSets)
      .where(
        inArray(workoutEntriesSets.workout_entries_exercise_id, workoutExerciseIds(workoutId)),
      );
    await tx
      .delete(workoutEntriesExercises)
      .where(eq(workoutEntriesExercises.workout_entries_id, workoutId));
    await tx.delete(workoutEntries).where(eq(workoutEntries.id, workoutId));
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
  drizzle.query.workoutEntries.findMany({
    columns: { id: true, name: true, started_at: true, finished_at: true },
    where: eq(workoutEntries.id, workoutId),
    with: {
      exercises: {
        columns: { id: true, exercise_id: true, rest_seconds: true },
        orderBy: asc(workoutEntriesExercises.position),
        with: {
          sets: {
            columns: { user_id: false, workout_entries_exercise_id: false },
            orderBy: asc(workoutEntriesSets.position),
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
    .select({
      id: workoutEntries.id,
      name: workoutEntries.name,
      started_at: workoutEntries.started_at,
    })
    .from(workoutEntries)
    .where(isNull(workoutEntries.finished_at))
    .orderBy(desc(workoutEntries.started_at))
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
  items: ExerciseItem[];
}

/** Finished workouts matching `where`, one row per exercise with its completed-set stats. */
const workoutSummaryQuery = (where?: SQL) =>
  drizzle
    .select({
      id: workoutEntries.id,
      name: workoutEntries.name,
      started_at: workoutEntries.started_at,
      finished_at: workoutEntries.finished_at,
      exercise_id: workoutEntriesExercises.exercise_id,
      sets: count(workoutEntriesSets.id),
      volume: sql<number>`coalesce(sum(${workoutEntriesSets.weight_kg} * ${workoutEntriesSets.reps}), 0)`,
      prs: sql<number>`coalesce(sum(${workoutEntriesSets.is_pr}), 0)`,
    })
    .from(workoutEntries)
    .leftJoin(
      workoutEntriesExercises,
      eq(workoutEntriesExercises.workout_entries_id, workoutEntries.id),
    )
    .leftJoin(
      workoutEntriesSets,
      and(
        eq(workoutEntriesSets.workout_entries_exercise_id, workoutEntriesExercises.id),
        isNotNull(workoutEntriesSets.completed_at),
      ),
    )
    .where(and(isNotNull(workoutEntries.finished_at), where))
    .groupBy(workoutEntries.id, workoutEntriesExercises.id)
    .orderBy(desc(workoutEntries.started_at), workoutEntriesExercises.position);

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
    // The weight on an assisted machine helps; nothing of it is lifted.
    if (!isAssisted(r.exercise_id)) w.volumeKg += r.volume;
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
      and(gte(workoutEntries.started_at, fromIso), lt(workoutEntries.started_at, toIso)),
    ),
    map: toSummaries,
  });
}

/** The latest `limit` finished workouts, newest first; a larger limit keeps the list shown. */
export function useWorkoutHistory(limit: number) {
  const latest = drizzle
    .select({ id: workoutEntries.id })
    .from(workoutEntries)
    .where(isNotNull(workoutEntries.finished_at))
    .orderBy(desc(workoutEntries.started_at))
    .limit(limit);
  return useDrizzleQuery({
    queryKey: queryKeys.workouts.history(limit).queryKey,
    query: workoutSummaryQuery(inArray(workoutEntries.id, latest)),
    map: toSummaries,
    keepPrevious: true,
  });
}

/** Number of finished workouts. */
export function useWorkoutCount() {
  return useDrizzleQuery({
    queryKey: queryKeys.workouts.count.queryKey,
    query: drizzle
      .select({ count: count() })
      .from(workoutEntries)
      .where(isNotNull(workoutEntries.finished_at)),
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
  /** Best set by `setScoreSql`. */
  topSet: ExerciseHistorySet;
  volumeKg: number;
  hasPr: boolean;
}

/** Sets that count for an exercise's history: completed (see hasKnownWeight), workout finished. */
const historySetsOf = (exerciseId: string) =>
  and(
    eq(workoutEntriesExercises.exercise_id, exerciseId),
    isNotNull(workoutEntriesSets.completed_at),
    isNotNull(workoutEntries.finished_at),
    hasKnownWeight(workoutEntriesSets, workoutEntriesExercises),
  );

const exerciseHistoryQuery = (exerciseId: string, where?: SQL) =>
  drizzle
    .select({
      workout_entries_id: workoutEntries.id,
      name: workoutEntries.name,
      started_at: workoutEntries.started_at,
      finished_at: workoutEntries.finished_at,
      exercise_id: workoutEntriesExercises.exercise_id,
      weight_kg: workoutEntriesSets.weight_kg,
      reps: workoutEntriesSets.reps,
      seconds: workoutEntriesSets.seconds,
      target_rir: workoutEntriesSets.target_rir,
      is_pr: workoutEntriesSets.is_pr,
      score: setScoreSql(workoutEntriesSets, workoutEntriesExercises),
    })
    .from(workoutEntriesSets)
    .innerJoin(
      workoutEntriesExercises,
      eq(workoutEntriesExercises.id, workoutEntriesSets.workout_entries_exercise_id),
    )
    .innerJoin(workoutEntries, eq(workoutEntries.id, workoutEntriesExercises.workout_entries_id))
    .where(and(historySetsOf(exerciseId), where))
    .orderBy(
      desc(workoutEntries.started_at),
      workoutEntriesExercises.position,
      workoutEntriesSets.position,
    );

function toExerciseHistory(rows: RowOf<typeof exerciseHistoryQuery>[]): ExerciseHistoryEntry[] {
  const map = new Map<string, Omit<ExerciseHistoryEntry, 'volumeKg' | 'hasPr'>>();
  const topScores = new Map<string, number>();
  for (const r of rows) {
    const set: ExerciseHistorySet = {
      weightKg: r.weight_kg,
      reps: r.reps,
      seconds: r.seconds,
      rir: r.target_rir,
      isPr: r.is_pr,
    };
    const entry = getOrInsert(map, r.workout_entries_id, () => ({
      workoutId: r.workout_entries_id,
      name: r.name,
      startedAt: r.started_at,
      finishedAt: r.finished_at,
      sets: [],
      topSet: set,
    }));
    entry.sets.push(set);
    // Sets come in order: of equal scores the first stays the top set.
    if (r.score > (topScores.get(r.workout_entries_id) ?? -Infinity)) {
      entry.topSet = set;
      topScores.set(r.workout_entries_id, r.score);
    }
  }
  // All rows are sets of the same exercise; the weight on an assisted machine isn't lifted.
  const lifted = !isAssisted(rows[0]?.exercise_id ?? '');
  return [...map.values()].map((entry) => ({
    ...entry,
    volumeKg: lifted
      ? entry.sets.reduce((sum, s) => sum + (s.weightKg ?? 0) * (s.reps ?? 0), 0)
      : 0,
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

const toLastSession = (rows: RowOf<typeof exerciseHistoryQuery>[]) => toExerciseHistory(rows)[0];

/** The newest session of `useExerciseHistory` alone ("last time"), without loading the rest. */
export function useLastExerciseSession(exerciseId: string | undefined) {
  const latest = drizzle
    .select({ id: workoutEntries.id })
    .from(workoutEntriesSets)
    .innerJoin(
      workoutEntriesExercises,
      eq(workoutEntriesExercises.id, workoutEntriesSets.workout_entries_exercise_id),
    )
    .innerJoin(workoutEntries, eq(workoutEntries.id, workoutEntriesExercises.workout_entries_id))
    .where(historySetsOf(exerciseId ?? ''))
    .orderBy(desc(workoutEntries.started_at))
    .limit(1);
  return useDrizzleQuery({
    queryKey: queryKeys.workouts.lastExerciseSession(exerciseId ?? '').queryKey,
    enabled: !!exerciseId,
    query: exerciseHistoryQuery(exerciseId ?? '', inArray(workoutEntries.id, latest)),
    map: toLastSession,
  });
}

const muscleVolumeQuery = (sinceIso: string) =>
  drizzle
    .select({
      exercise_id: workoutEntriesExercises.exercise_id,
      started_at: workoutEntries.started_at,
      sets: count(workoutEntriesSets.id),
    })
    .from(workoutEntriesSets)
    .innerJoin(
      workoutEntriesExercises,
      eq(workoutEntriesExercises.id, workoutEntriesSets.workout_entries_exercise_id),
    )
    .innerJoin(workoutEntries, eq(workoutEntries.id, workoutEntriesExercises.workout_entries_id))
    .where(
      and(isNotNull(workoutEntriesSets.completed_at), gte(workoutEntries.started_at, sinceIso)),
    )
    .groupBy(workoutEntries.id, workoutEntriesExercises.exercise_id);

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
