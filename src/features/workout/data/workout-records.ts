import { createQueryKeys } from '@lukemorales/query-key-factory';
import { and, asc, desc, eq, isNotNull, lt, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';

import { parseJson } from '@/shared/data/json';
import { drizzle } from '@/shared/data/powersync/database';
import {
  workoutEntriesExercises,
  workoutEntries,
  workoutEntriesSets,
} from '@/shared/data/powersync/schema';
import { type RowOf, useDrizzleQuery } from '@/shared/data/use-drizzle-query';
import { hasKnownWeight, previousExercise, previousSet, setScoreSql } from '@/shared/data/workouts';
import type { SetValues } from '@/shared/lib/format';

const recordKeys = createQueryKeys('workoutRecords', {
  detail: (workoutId: string) => [workoutId],
});

export interface WorkoutRecord {
  exerciseId: string;
  set: SetValues;
  previous: SetValues;
}

const previousWorkout = alias(workoutEntries, 'previous_workout');

/**
 * Best completed set (by `setScoreSql`) of the same exercise from an earlier workout. Built per
 * query because hasKnownWeight/setScoreSql read the current exercise catalog.
 */
const previousBest = () =>
  drizzle
    .select({
      best: sql`json_object('weightKg', ${previousSet.weight_kg}, 'reps', ${previousSet.reps}, 'seconds', ${previousSet.seconds})`,
    })
    .from(previousSet)
    .innerJoin(previousExercise, eq(previousExercise.id, previousSet.workout_entries_exercise_id))
    .innerJoin(previousWorkout, eq(previousWorkout.id, previousExercise.workout_entries_id))
    .where(
      and(
        eq(previousExercise.exercise_id, workoutEntriesExercises.exercise_id),
        isNotNull(previousSet.completed_at),
        hasKnownWeight(previousSet, previousExercise),
        lt(previousWorkout.started_at, workoutEntries.started_at),
      ),
    )
    .orderBy(desc(setScoreSql(previousSet, previousExercise)))
    .limit(1);

/** PR sets of one workout, each with the previous best as JSON. */
const recordsQuery = (workoutId: string) =>
  drizzle
    .select({
      exercise_id: workoutEntriesExercises.exercise_id,
      weight_kg: workoutEntriesSets.weight_kg,
      reps: workoutEntriesSets.reps,
      seconds: workoutEntriesSets.seconds,
      score: setScoreSql(workoutEntriesSets, workoutEntriesExercises),
      previous: sql<string | null>`${previousBest()}`,
    })
    .from(workoutEntriesSets)
    .innerJoin(
      workoutEntriesExercises,
      eq(workoutEntriesExercises.id, workoutEntriesSets.workout_entries_exercise_id),
    )
    .innerJoin(workoutEntries, eq(workoutEntries.id, workoutEntriesExercises.workout_entries_id))
    .where(
      and(
        eq(workoutEntries.id, workoutId),
        eq(workoutEntriesSets.is_pr, true),
        isNotNull(workoutEntriesSets.completed_at),
      ),
    )
    .orderBy(asc(workoutEntriesExercises.position), asc(workoutEntriesSets.position));

/** Best PR set per exercise; only exercises with an earlier best are kept. */
function toRecords(rows: RowOf<typeof recordsQuery>[]): WorkoutRecord[] {
  const best = new Map<string, WorkoutRecord & { score: number }>();
  for (const r of rows) {
    const previous = parseJson<SetValues | null>(r.previous, null);
    if (!previous) continue;
    const current = best.get(r.exercise_id);
    if (current && current.score >= r.score) continue;
    const set = { weightKg: r.weight_kg, reps: r.reps, seconds: r.seconds };
    best.set(r.exercise_id, { exerciseId: r.exercise_id, set, previous, score: r.score });
  }
  return [...best.values()].map(({ exerciseId, set, previous }) => ({ exerciseId, set, previous }));
}

/** New personal records of a workout with the best set from before it. */
export function useWorkoutRecords(workoutId: string | undefined) {
  return useDrizzleQuery({
    queryKey: recordKeys.detail(workoutId ?? '').queryKey,
    enabled: !!workoutId,
    query: recordsQuery(workoutId ?? ''),
    map: toRecords,
  });
}
