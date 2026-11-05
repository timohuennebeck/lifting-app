import { and, count, eq, gte, isNotNull } from 'drizzle-orm';

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
const exerciseSetsQuery = (fromIso: string) =>
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
    .where(and(isNotNull(workoutEntriesSets.completed_at), gte(workoutEntries.started_at, fromIso)))
    .groupBy(workoutEntries.id, workoutEntriesExercises.exercise_id);

const toExerciseSets = (rows: RowOf<typeof exerciseSetsQuery>[]) =>
  rows.map((r): ExerciseSets => ({
    workoutId: r.workout_id,
    startedAt: r.started_at,
    exerciseId: r.exercise_id,
    sets: r.sets,
  }));

/** Completed sets per exercise and workout, of workouts started from `fromIso` on. */
export function useExerciseSets(fromIso: string) {
  return useDrizzleQuery({
    queryKey: queryKeys.workouts.exerciseSets(fromIso).queryKey,
    query: exerciseSetsQuery(fromIso),
    map: toExerciseSets,
  });
}
