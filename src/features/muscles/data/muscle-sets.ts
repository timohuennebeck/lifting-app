import { count, eq, isNotNull } from 'drizzle-orm';

import { drizzle } from '@/shared/data/powersync/database';
import {
  workoutEntries,
  workoutEntriesExercises,
  workoutEntriesSets,
} from '@/shared/data/powersync/schema';
import { queryKeys } from '@/shared/data/query-keys';
import { type RowOf, useDrizzleQuery } from '@/shared/data/use-drizzle-query';

import type { ExerciseSets } from '../lib/muscle-sets';

// Every completed set counts, identical ones too: one row per exercise and workout.
const exerciseSetsQuery = () =>
  drizzle
    .select({
      workout_id: workoutEntries.id,
      started_at: workoutEntries.started_at,
      exercise_id: workoutEntriesExercises.exercise_id,
      sets: count(),
    })
    .from(workoutEntriesSets)
    .innerJoin(
      workoutEntriesExercises,
      eq(workoutEntriesExercises.id, workoutEntriesSets.workout_entries_exercise_id),
    )
    .innerJoin(workoutEntries, eq(workoutEntries.id, workoutEntriesExercises.workout_entries_id))
    .where(isNotNull(workoutEntriesSets.completed_at))
    .groupBy(workoutEntries.id, workoutEntriesExercises.exercise_id);

const toExerciseSets = (rows: RowOf<typeof exerciseSetsQuery>[]) =>
  rows.map((r): ExerciseSets => ({
    workoutId: r.workout_id,
    startedAt: r.started_at,
    exerciseId: r.exercise_id,
    sets: r.sets,
  }));

/**
 * Completed sets per exercise and workout, of the whole history: every period counts from the
 * same rows, so switching one doesn't load again.
 */
export function useExerciseSets() {
  return useDrizzleQuery({
    queryKey: queryKeys.workouts.exerciseSets.queryKey,
    query: exerciseSetsQuery(),
    map: toExerciseSets,
  });
}
