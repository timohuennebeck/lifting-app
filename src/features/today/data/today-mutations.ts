import { and, desc, eq, isNotNull, ne, sql } from 'drizzle-orm';

import { isBodyweight, measuresOf } from '@/shared/data/exercises';
import { drizzle } from '@/shared/data/powersync/database';
import {
  workoutEntries,
  workoutEntriesExercises,
  workoutEntriesSets,
} from '@/shared/data/powersync/schema';
import { insertWorkout, previousExercise, previousSet } from '@/shared/data/workouts';
import { MINUTE_MS } from '@/shared/lib/date';

/**
 * Last logged weight of the exercise of the set being updated, from any other workout.
 * Correlated subquery for an UPDATE of `workout_entries_sets`.
 */
function lastWeightOutside(workoutId: string) {
  const exerciseOfUpdatedSet = drizzle
    .select({ exercise_id: workoutEntriesExercises.exercise_id })
    .from(workoutEntriesExercises)
    .where(eq(workoutEntriesExercises.id, workoutEntriesSets.workout_entries_exercise_id));
  return drizzle
    .select({ weight_kg: previousSet.weight_kg })
    .from(previousSet)
    .innerJoin(previousExercise, eq(previousExercise.id, previousSet.workout_entries_exercise_id))
    .where(
      and(
        ne(previousExercise.workout_entries_id, workoutId),
        isNotNull(previousSet.completed_at),
        isNotNull(previousSet.weight_kg),
        eq(previousExercise.exercise_id, exerciseOfUpdatedSet),
      ),
    )
    .orderBy(desc(previousSet.completed_at))
    .limit(1);
}

/**
 * Logs a routine as done without live tracking: every set is completed with its
 * target reps (or seconds) and the exercise's last logged weight, dated to `day` at the
 * current time.
 */
export async function markRoutineDone(
  userId: string,
  routineId: string,
  name: string,
  day: Date,
  minutes: number,
) {
  const now = new Date();
  const start = new Date(day);
  start.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
  const end = new Date(start.getTime() + minutes * MINUTE_MS);
  // One transaction, so the workout never shows up as running or half-written.
  return drizzle.transaction(async (tx) => {
    const workoutId = await insertWorkout(tx, userId, name, routineId);
    const target = sql<number>`coalesce(${workoutEntriesSets.target_max}, ${workoutEntriesSets.target_min})`;
    const exercises = await tx
      .select({ id: workoutEntriesExercises.id, exercise_id: workoutEntriesExercises.exercise_id })
      .from(workoutEntriesExercises)
      .where(eq(workoutEntriesExercises.workout_entries_id, workoutId));
    // Each exercise fills only the boxes it has. Bodyweight moves never logged before start at
    // 0 kg extra; other weighted ones stay without weight and are left out of records.
    for (const exercise of exercises) {
      const measures = measuresOf(exercise.exercise_id);
      const fallback = isBodyweight(exercise.exercise_id) ? 0 : null;
      await tx
        .update(workoutEntriesSets)
        .set({
          completed_at: end.toISOString(),
          weight_kg: measures.includes('weight')
            ? sql`coalesce((${lastWeightOutside(workoutId)}), ${fallback})`
            : null,
          reps: measures.includes('reps') ? sql`coalesce(${target}, 0)` : null,
          seconds: measures.includes('seconds') ? target : null,
        })
        .where(eq(workoutEntriesSets.workout_entries_exercise_id, exercise.id));
    }
    await tx
      .update(workoutEntries)
      .set({ started_at: start.toISOString(), finished_at: end.toISOString() })
      .where(eq(workoutEntries.id, workoutId));
    return workoutId;
  });
}
