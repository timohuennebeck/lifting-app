import { eq } from 'drizzle-orm';

import { drizzle } from '@/shared/data/powersync/database';
import { routines } from '@/shared/data/powersync/schema';
import { insertRoutine, insertRoutineExercise } from '@/shared/data/routines';

import type { WorkoutChart } from '../lib/charts';

/**
 * Saves the workout of an answer to the library, under the answer's id: only one that is opened
 * ends up there, and tapping it again, on any device, opens the same routine. One deleted since is
 * saved anew.
 */
export async function saveCoachWorkout(userId: string, answerId: string, workout: WorkoutChart) {
  await drizzle.transaction(async (tx) => {
    const saved = await tx
      .select({ id: routines.id })
      .from(routines)
      .where(eq(routines.id, answerId))
      .get();
    if (saved) return;
    await insertRoutine(tx, userId, null, workout.name, undefined, answerId);
    for (const [position, exercise] of workout.exercises.entries()) {
      const { exerciseId, sets, targetMin, targetMax, rir, restSeconds } = exercise;
      await insertRoutineExercise(tx, userId, answerId, position, {
        exerciseId,
        restSeconds,
        sets: Array.from({ length: sets }, () => ({ targetMin, targetMax, rir })),
      });
    }
  });
}
