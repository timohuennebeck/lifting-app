import {
  and,
  count,
  desc,
  eq,
  gte,
  inArray,
  isNotNull,
  isNull,
  lt,
  min,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import type { AnySQLiteColumn } from 'drizzle-orm/sqlite-core';

import type { SetValues } from '@/shared/lib/format';
import { getOrInsert } from '@/shared/lib/map';
import { DEFAULT_BODY_WEIGHT_KG } from '@/shared/lib/body-weight';

import {
  assistedExerciseIds,
  bodyweightExerciseIds,
  exerciseIdsWithout,
  isAssisted,
} from './exercises';
import { drizzle } from './powersync/database';
import {
  weightEntries,
  workoutEntries,
  workoutEntriesExercises,
  workoutEntriesSets,
} from './powersync/schema';
import { queryKeys } from './query-keys';
import { type RowOf, useDrizzleQuery } from './use-drizzle-query';

/**
 * The user's latest body weight, for bodyweight and assisted sets where the logged weight is
 * only the added load or the assistance: without it a pull-up at 0 kg would score 0 whatever the
 * reps. The device only holds the user's own weight entries.
 */
const bodyweightSql = sql<number>`coalesce((select ${weightEntries.weight_kg} from ${weightEntries} order by ${weightEntries.date} desc limit 1), ${DEFAULT_BODY_WEIGHT_KG})`;

/**
 * Whether a completed set counts for history and records: one without a weight only for an
 * exercise that logs none. Sets logged before the catalog gave their exercise a weight have none,
 * and stay out.
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
  /** Completed sets. */
  setCount: number;
}

/**
 * Completed sets of the workout in the outer query. A correlated count keeps to the indexes: a
 * LEFT JOIN through PowerSync's views reads every set for each workout.
 */
const completedSets = sql<number>`${drizzle
  .select({ count: count() })
  .from(workoutEntriesSets)
  .innerJoin(
    workoutEntriesExercises,
    eq(workoutEntriesExercises.id, workoutEntriesSets.workout_entries_exercise_id),
  )
  .where(
    and(
      eq(workoutEntriesExercises.workout_entries_id, workoutEntries.id),
      isNotNull(workoutEntriesSets.completed_at),
    ),
  )}`;

/** Finished workouts matching `where`, newest first, with their completed set counts. */
const workoutSummaryQuery = (where?: SQL) =>
  drizzle
    .select({
      id: workoutEntries.id,
      name: workoutEntries.name,
      started_at: workoutEntries.started_at,
      finished_at: workoutEntries.finished_at,
      sets: completedSets,
    })
    .from(workoutEntries)
    .where(and(isNotNull(workoutEntries.finished_at), where))
    .orderBy(desc(workoutEntries.started_at));

const toSummaries = (rows: RowOf<typeof workoutSummaryQuery>[]) =>
  rows.map((r): WorkoutSummary => ({
    id: r.id,
    name: r.name,
    startedAt: r.started_at,
    // The query only returns finished workouts.
    finishedAt: r.finished_at!,
    setCount: r.sets,
  }));

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

const workoutStatsQuery = () =>
  drizzle
    .select({ count: count(), first: min(workoutEntries.started_at) })
    .from(workoutEntries)
    .where(isNotNull(workoutEntries.finished_at));

const toWorkoutStats = (rows: RowOf<typeof workoutStatsQuery>[]) => ({
  count: rows[0]?.count ?? 0,
  first: rows[0]?.first ?? null,
});

/** How many workouts are finished and when the first of them started. */
export function useWorkoutStats() {
  return useDrizzleQuery({
    queryKey: queryKeys.workouts.stats.queryKey,
    query: workoutStatsQuery(),
    map: toWorkoutStats,
  });
}

export interface ExerciseHistorySet extends SetValues {
  /** Reps in reserve as entered in the number pad; null when none was. */
  rir: number | null;
  isPr: boolean;
}

export interface ExerciseHistoryEntry {
  workoutId: string;
  /** Workout name. */
  name: string;
  startedAt: string;
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
      exercise_id: workoutEntriesExercises.exercise_id,
      weight_kg: workoutEntriesSets.weight_kg,
      reps: workoutEntriesSets.reps,
      seconds: workoutEntriesSets.seconds,
      rir: workoutEntriesSets.rir,
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
      rir: r.rir,
      isPr: r.is_pr,
    };
    const entry = getOrInsert(map, r.workout_entries_id, () => ({
      workoutId: r.workout_entries_id,
      name: r.name,
      startedAt: r.started_at,
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
  // All rows are sets of the same exercise.
  const exerciseId = rows[0]?.exercise_id ?? '';
  return [...map.values()].map((entry) => ({
    ...entry,
    volumeKg: volumeKg(exerciseId, entry.sets),
    hasPr: entry.sets.some((s) => s.isPr),
  }));
}

/**
 * Weight moved by sets of one exercise: weight × reps. Bodyweight exercises count their added
 * weight; the weight on an assisted machine isn't lifted, and timed sets have no reps.
 */
export function volumeKg(exerciseId: string, sets: Pick<SetValues, 'weightKg' | 'reps'>[]) {
  if (isAssisted(exerciseId)) return 0;
  return sets.reduce((sum, s) => sum + (s.weightKg ?? 0) * (s.reps ?? 0), 0);
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
