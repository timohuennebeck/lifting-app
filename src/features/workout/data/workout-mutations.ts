import { desc, eq } from 'drizzle-orm';

import { drizzle } from '@/shared/data/powersync/database';
import { workoutExercises, workoutSets } from '@/shared/data/powersync/schema';
import { insertWorkoutSet, type SetTargets } from '@/shared/data/workouts';

/** Replaces the exercise of a running workout entry and clears its logged sets. */
export async function swapWorkoutExercise(workoutExerciseId: string, exerciseId: string) {
  await drizzle.transaction(async (tx) => {
    await tx
      .update(workoutExercises)
      .set({ exercise_id: exerciseId })
      .where(eq(workoutExercises.id, workoutExerciseId));
    await tx
      .update(workoutSets)
      .set({ weight_kg: null, reps: null, completed_at: null, is_pr: false })
      .where(eq(workoutSets.workout_exercise_id, workoutExerciseId));
  });
}

/** Appends a set that copies the targets of the current last set. */
export async function addWorkoutSet(userId: string, workoutExerciseId: string) {
  // One write transaction, so a quick double tap cannot reuse the same position.
  await drizzle.transaction(async (tx) => {
    const last = await tx
      .select({
        position: workoutSets.position,
        target_min: workoutSets.target_min,
        target_max: workoutSets.target_max,
        target_rir: workoutSets.target_rir,
      })
      .from(workoutSets)
      .where(eq(workoutSets.workout_exercise_id, workoutExerciseId))
      .orderBy(desc(workoutSets.position))
      .limit(1)
      .get();
    await insertWorkoutSet(tx, userId, workoutExerciseId, (last?.position ?? -1) + 1, {
      min: last?.target_min ?? 8,
      max: last?.target_max ?? 12,
      rir: last?.target_rir ?? 2,
    });
  });
}

export async function removeWorkoutSet(setId: string) {
  await drizzle.delete(workoutSets).where(eq(workoutSets.id, setId));
}

/** Marks a logged set as open again; its values stay as the prefill. */
export async function unlogSet(setId: string) {
  await drizzle
    .update(workoutSets)
    .set({ completed_at: null, is_pr: false })
    .where(eq(workoutSets.id, setId));
}

export async function updateSetTargets(setId: string, { min, max, rir }: SetTargets) {
  await drizzle
    .update(workoutSets)
    .set({ target_min: min, target_max: max, target_rir: rir })
    .where(eq(workoutSets.id, setId));
}
