import { eq, isNotNull } from 'drizzle-orm';

import { drizzle } from '@/shared/data/powersync/database';
import {
  workoutEntries,
  workoutEntriesExercises,
  workoutEntriesSets,
} from '@/shared/data/powersync/schema';
import { queryKeys } from '@/shared/data/query-keys';
import { type RowOf, useDrizzleQuery } from '@/shared/data/use-drizzle-query';

// Identical sets of an exercise in a workout count once: they make the same level.
const levelSetsQuery = () =>
  drizzle
    .selectDistinct({
      exercise_id: workoutEntriesExercises.exercise_id,
      started_at: workoutEntries.started_at,
      weight_kg: workoutEntriesSets.weight_kg,
      reps: workoutEntriesSets.reps,
      seconds: workoutEntriesSets.seconds,
    })
    .from(workoutEntriesSets)
    .innerJoin(
      workoutEntriesExercises,
      eq(workoutEntriesExercises.id, workoutEntriesSets.workout_entries_exercise_id),
    )
    .innerJoin(workoutEntries, eq(workoutEntries.id, workoutEntriesExercises.workout_entries_id))
    .where(isNotNull(workoutEntriesSets.completed_at));

const toLevelSets = (rows: RowOf<typeof levelSetsQuery>[]) =>
  rows.map((r) => ({
    exerciseId: r.exercise_id,
    startedAt: r.started_at,
    weightKg: r.weight_kg,
    reps: r.reps,
    seconds: r.seconds,
  }));

/** Every completed set with what it logged (muscle levels). */
export function useLevelSets() {
  return useDrizzleQuery({
    queryKey: queryKeys.workouts.levelSets.queryKey,
    query: levelSetsQuery(),
    map: toLevelSets,
  });
}
