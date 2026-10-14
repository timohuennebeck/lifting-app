import { createQueryKeys } from '@lukemorales/query-key-factory';
import { and, eq, inArray, isNotNull, sql } from 'drizzle-orm';

import { assistedExerciseIds } from '@/shared/data/exercises';
import { drizzle } from '@/shared/data/powersync/database';
import {
  workoutEntriesExercises,
  workoutEntries,
  workoutEntriesSets,
} from '@/shared/data/powersync/schema';
import { type RowOf, useDrizzleQuery } from '@/shared/data/use-drizzle-query';
import { hasKnownWeight } from '@/shared/data/workouts';
import type { SetValues } from '@/shared/lib/format';

const searchKeys = createQueryKeys('search', { records: null });

export interface ExerciseRecord {
  /** The heaviest set (the least assisted one), then most reps, then most seconds. */
  best: SetValues;
  /** Start of the last finished workout with this exercise. */
  lastAt: string;
}

// Sets of finished workouts, ranked per exercise by weight (on an assisted machine less is
// better), then reps, then seconds (a missing value counts as -1, so exercises without weight
// start at reps); ties keep any one of them. Built per call: the conditions read the current
// exercise catalog.
const rankedSets = () =>
  drizzle
    .select({
      exercise_id: workoutEntriesExercises.exercise_id,
      weight_kg: workoutEntriesSets.weight_kg,
      reps: workoutEntriesSets.reps,
      seconds: workoutEntriesSets.seconds,
      last_at: sql<string>`max(${workoutEntries.started_at}) over (
      partition by ${workoutEntriesExercises.exercise_id}
    )`.as('last_at'),
      rank: sql<number>`row_number() over (
      partition by ${workoutEntriesExercises.exercise_id}
      order by case when ${inArray(workoutEntriesExercises.exercise_id, assistedExerciseIds())}
        then -${workoutEntriesSets.weight_kg} else coalesce(${workoutEntriesSets.weight_kg}, -1) end desc,
        coalesce(${workoutEntriesSets.reps}, -1) desc, coalesce(${workoutEntriesSets.seconds}, -1) desc
    )`.as('rank'),
    })
    .from(workoutEntriesSets)
    .innerJoin(
      workoutEntriesExercises,
      eq(workoutEntriesExercises.id, workoutEntriesSets.workout_entries_exercise_id),
    )
    .innerJoin(workoutEntries, eq(workoutEntries.id, workoutEntriesExercises.workout_entries_id))
    // The same sets as an exercise's history: a weighted exercise's set without a weight doesn't count.
    .where(
      and(
        isNotNull(workoutEntriesSets.completed_at),
        isNotNull(workoutEntries.finished_at),
        hasKnownWeight(workoutEntriesSets, workoutEntriesExercises),
      ),
    )
    .as('ranked_sets');

// One row per exercise, aggregated in SQLite instead of loading every logged set.
const recordsQuery = () => {
  const ranked = rankedSets();
  return drizzle
    .select({
      exercise_id: ranked.exercise_id,
      weight_kg: ranked.weight_kg,
      reps: ranked.reps,
      seconds: ranked.seconds,
      last_at: ranked.last_at,
    })
    .from(ranked)
    .where(eq(ranked.rank, 1));
};

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
