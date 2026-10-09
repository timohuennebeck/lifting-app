import { createQueryKeys } from '@lukemorales/query-key-factory';
import { and, asc, desc, eq, isNotNull, lt, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';

import { parseJson } from '@/shared/data/json';
import { drizzle } from '@/shared/data/powersync/database';
import { workoutExercises, workouts, workoutSets } from '@/shared/data/powersync/schema';
import { type RowOf, useDrizzleQuery } from '@/shared/data/use-drizzle-query';
import {
  hasKnownWeight,
  previousExercise,
  previousSet,
  setScore,
  setScoreSql,
} from '@/shared/data/workouts';
import type { SetValues } from '@/shared/lib/format';

const recordKeys = createQueryKeys('workoutRecords', {
  detail: (workoutId: string) => [workoutId],
});

export interface WorkoutRecord {
  exerciseId: string;
  set: SetValues;
  previous: SetValues;
}

const previousWorkout = alias(workouts, 'previous_workout');

/** Best completed set (by `setScore`) of the same exercise from an earlier workout. */
const previousBest = drizzle
  .select({
    best: sql`json_object('weightKg', ${previousSet.weight_kg}, 'reps', ${previousSet.reps}, 'seconds', ${previousSet.seconds})`,
  })
  .from(previousSet)
  .innerJoin(previousExercise, eq(previousExercise.id, previousSet.workout_exercise_id))
  .innerJoin(previousWorkout, eq(previousWorkout.id, previousExercise.workout_id))
  .where(
    and(
      eq(previousExercise.exercise_id, workoutExercises.exercise_id),
      isNotNull(previousSet.completed_at),
      hasKnownWeight(previousSet, previousExercise),
      lt(previousWorkout.started_at, workouts.started_at),
    ),
  )
  .orderBy(desc(setScoreSql(previousSet)))
  .limit(1);

/** PR sets of one workout, each with the previous best as JSON. */
const recordsQuery = (workoutId: string) =>
  drizzle
    .select({
      exercise_id: workoutExercises.exercise_id,
      weight_kg: workoutSets.weight_kg,
      reps: workoutSets.reps,
      seconds: workoutSets.seconds,
      previous: sql<string | null>`${previousBest}`,
    })
    .from(workoutSets)
    .innerJoin(workoutExercises, eq(workoutExercises.id, workoutSets.workout_exercise_id))
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workout_id))
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workoutSets.is_pr, true),
        isNotNull(workoutSets.completed_at),
      ),
    )
    .orderBy(asc(workoutExercises.position), asc(workoutSets.position));

/** Best PR set per exercise; only exercises with an earlier best are kept. */
function toRecords(rows: RowOf<typeof recordsQuery>[]): WorkoutRecord[] {
  const best = new Map<string, WorkoutRecord>();
  for (const r of rows) {
    const previous = parseJson<SetValues | null>(r.previous, null);
    if (!previous) continue;
    const set = { weightKg: r.weight_kg, reps: r.reps, seconds: r.seconds };
    const current = best.get(r.exercise_id);
    if (current && setScore(current.set) >= setScore(set)) continue;
    best.set(r.exercise_id, { exerciseId: r.exercise_id, set, previous });
  }
  return [...best.values()];
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
