import { createQueryKeys } from '@lukemorales/query-key-factory';
import { and, eq, isNotNull, sql } from 'drizzle-orm';

import { drizzle } from '@/shared/data/powersync/database';
import { workoutExercises, workouts, workoutSets } from '@/shared/data/powersync/schema';
import { type RowOf, useDrizzleQuery } from '@/shared/data/use-drizzle-query';
import type { SetValues } from '@/shared/lib/format';

const searchKeys = createQueryKeys('search', { records: null });

export interface ExerciseRecord {
  /** The heaviest set: most weight, then most reps, then most seconds. */
  best: SetValues;
  /** Start of the last finished workout with this exercise. */
  lastAt: string;
}

// Sets of finished workouts, ranked per exercise by weight, then reps, then seconds (a missing
// value counts as -1, so exercises without weight start at reps); ties keep any one of them.
const rankedSets = drizzle
  .select({
    exercise_id: workoutExercises.exercise_id,
    weight_kg: workoutSets.weight_kg,
    reps: workoutSets.reps,
    seconds: workoutSets.seconds,
    last_at: sql<string>`max(${workouts.started_at}) over (
      partition by ${workoutExercises.exercise_id}
    )`.as('last_at'),
    rank: sql<number>`row_number() over (
      partition by ${workoutExercises.exercise_id}
      order by coalesce(${workoutSets.weight_kg}, -1) desc, coalesce(${workoutSets.reps}, -1) desc,
        coalesce(${workoutSets.seconds}, -1) desc
    )`.as('rank'),
  })
  .from(workoutSets)
  .innerJoin(workoutExercises, eq(workoutExercises.id, workoutSets.workout_exercise_id))
  .innerJoin(workouts, eq(workouts.id, workoutExercises.workout_id))
  .where(and(isNotNull(workoutSets.completed_at), isNotNull(workouts.finished_at)))
  .as('ranked_sets');

// One row per exercise, aggregated in SQLite instead of loading every logged set.
const recordsQuery = () =>
  drizzle
    .select({
      exercise_id: rankedSets.exercise_id,
      weight_kg: rankedSets.weight_kg,
      reps: rankedSets.reps,
      seconds: rankedSets.seconds,
      last_at: rankedSets.last_at,
    })
    .from(rankedSets)
    .where(eq(rankedSets.rank, 1));

function toRecords(rows: RowOf<typeof recordsQuery>[]) {
  const records = new Map<string, ExerciseRecord>();
  for (const r of rows) {
    records.set(r.exercise_id, {
      best: { weightKg: r.weight_kg, reps: r.reps, seconds: r.seconds },
      lastAt: r.last_at,
    });
  }
  return records;
}

/** Each trained exercise's heaviest set and when it was last done, from finished workouts. */
export function useExerciseRecords() {
  return useDrizzleQuery({
    queryKey: searchKeys.records.queryKey,
    query: recordsQuery(),
    map: toRecords,
  });
}
