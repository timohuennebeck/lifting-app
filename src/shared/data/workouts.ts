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
  sql,
  type SQL,
} from 'drizzle-orm';

import { getOrInsert } from '@/shared/lib/map';

import { newId, nowIso } from './json';
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

/** Epley estimated one-rep max, used for PR detection. */
export const estimateOneRepMax = (kg: number, reps: number) => kg * (1 + reps / 30);

/** Subquery with the ids of a workout's exercises, for `inArray(…)`. */
export const workoutExerciseIds = (workoutId: string) =>
  drizzle
    .select({ id: workoutExercises.id })
    .from(workoutExercises)
    .where(eq(workoutExercises.workout_id, workoutId));

/** Copies a template (or nothing, for an empty workout) into a new running workout. */
export async function startWorkout(userId: string, name: string, templateId: string | null) {
  return drizzle.transaction((tx) => insertWorkout(tx, userId, name, templateId));
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
  const exercises = await tx
    .select()
    .from(templateExercises)
    .where(eq(templateExercises.template_id, templateId))
    .orderBy(templateExercises.position);
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
    const sets = await tx
      .select()
      .from(templateSets)
      .where(eq(templateSets.template_exercise_id, te.id))
      .orderBy(templateSets.position);
    if (!sets.length) continue;
    // Template targets become the workout's empty sets.
    await tx.insert(workoutSets).values(
      sets.map((set) => ({
        id: newId(),
        user_id: userId,
        workout_exercise_id: workoutExerciseId,
        position: set.position,
        target_min: set.reps_min,
        target_max: set.reps_max,
        target_rir: set.rir,
        is_pr: false,
      })),
    );
  }
  return workoutId;
}

export interface SetTargets {
  min: number;
  max: number;
  rir: number | null;
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

/** Adds an exercise with `setCount` empty sets to a running workout. */
export async function addWorkoutExercise(
  userId: string,
  workoutId: string,
  exerciseId: string,
  setCount = 3,
  target: SetTargets = { min: 8, max: 12, rir: 2 },
) {
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
    for (let i = 0; i < setCount; i++) await insertWorkoutSet(tx, userId, id, i, target);
  });
}

/** Best estimated 1RM for an exercise across all completed sets, excluding one set. */
async function bestOneRepMax(exerciseId: string, excludeSetId: string) {
  const rows = await drizzle
    .select({ weight_kg: workoutSets.weight_kg, reps: workoutSets.reps })
    .from(workoutSets)
    .innerJoin(workoutExercises, eq(workoutExercises.id, workoutSets.workout_exercise_id))
    .where(
      and(
        eq(workoutExercises.exercise_id, exerciseId),
        isNotNull(workoutSets.completed_at),
        ne(workoutSets.id, excludeSetId),
      ),
    );
  return rows.reduce(
    (best, r) => Math.max(best, estimateOneRepMax(r.weight_kg ?? 0, r.reps ?? 0)),
    0,
  );
}

/** Completes (or re-edits) a set. Returns true when it is a new personal record. */
export async function logSet(setId: string, exerciseId: string, weightKg: number, reps: number) {
  const best = await bestOneRepMax(exerciseId, setId);
  const isPr = best > 0 && estimateOneRepMax(weightKg, reps) > best + 0.01;
  await drizzle
    .update(workoutSets)
    .set({
      weight_kg: weightKg,
      reps,
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

export interface WorkoutSet {
  id: string;
  position: number;
  targetMin: number | null;
  targetMax: number | null;
  targetRir: number | null;
  weightKg: number | null;
  reps: number | null;
  completedAt: string | null;
  isPr: boolean;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  position: number;
  restSeconds: number | null;
  sets: WorkoutSet[];
}

export interface WorkoutDetail {
  id: string;
  name: string;
  templateId: string | null;
  startedAt: string;
  finishedAt: string | null;
  exercises: WorkoutExercise[];
}

/** One workout with its exercises and their sets, each ordered by position. */
const workoutDetailQuery = (workoutId: string) =>
  drizzle.query.workouts.findMany({
    columns: { id: true, name: true, template_id: true, started_at: true, finished_at: true },
    where: eq(workouts.id, workoutId),
    with: {
      exercises: {
        columns: { id: true, exercise_id: true, position: true, rest_seconds: true },
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
  completedAt: s.completed_at,
  isPr: s.is_pr,
});

function toDetail([w]: WorkoutDetailRow[]): WorkoutDetail | null {
  if (!w) return null;
  return {
    id: w.id,
    name: w.name,
    templateId: w.template_id,
    startedAt: w.started_at,
    finishedAt: w.finished_at,
    exercises: w.exercises.map((e) => ({
      id: e.id,
      exerciseId: e.exercise_id,
      position: e.position,
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
  templateId: string | null;
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
      template_id: workouts.template_id,
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
      templateId: r.template_id,
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

export function useWorkoutHistory() {
  return useDrizzleQuery({
    queryKey: queryKeys.workouts.history.queryKey,
    query: workoutSummaryQuery(),
    map: toSummaries,
  });
}

export interface ExerciseHistorySet {
  position: number;
  weightKg: number;
  reps: number;
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
  /** Heaviest set (most reps on ties). */
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
      position: workoutSets.position,
      weight_kg: workoutSets.weight_kg,
      reps: workoutSets.reps,
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
        isNotNull(workoutSets.weight_kg),
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
      position: r.position,
      // The query only returns sets with a weight; completed sets always have reps.
      weightKg: r.weight_kg!,
      reps: r.reps!,
      rir: r.target_rir,
      isPr: r.is_pr,
    });
  }
  return [...map.values()].map((entry) => ({
    ...entry,
    topSet: entry.sets.reduce((top, set) =>
      set.weightKg > top.weightKg || (set.weightKg === top.weightKg && set.reps > top.reps)
        ? set
        : top,
    ),
    volumeKg: entry.sets.reduce((sum, s) => sum + s.weightKg * s.reps, 0),
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
    .select({ exercise_id: workoutExercises.exercise_id, sets: count(workoutSets.id) })
    .from(workoutSets)
    .innerJoin(workoutExercises, eq(workoutExercises.id, workoutSets.workout_exercise_id))
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workout_id))
    .where(and(isNotNull(workoutSets.completed_at), gte(workouts.started_at, sinceIso)))
    .groupBy(workoutExercises.exercise_id);

const toMuscleVolume = (rows: RowOf<typeof muscleVolumeQuery>[]) =>
  rows.map((r) => ({ exerciseId: r.exercise_id, sets: r.sets }));

/** Completed set counts per exercise since a date (Muscles tab). */
export function useMuscleVolume(sinceIso: string) {
  return useDrizzleQuery({
    queryKey: queryKeys.workouts.muscleVolume(sinceIso).queryKey,
    query: muscleVolumeQuery(sinceIso),
    map: toMuscleVolume,
  });
}
