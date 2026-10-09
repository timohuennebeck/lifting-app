import { desc, eq } from 'drizzle-orm';

import { defaultTargets, isTimed } from '@/shared/data/exercises';
import { drizzle, type Tx } from '@/shared/data/powersync/database';
import { workoutExercises, workoutSets } from '@/shared/data/powersync/schema';
import { insertWorkoutSet, type SetTargets } from '@/shared/data/workouts';

async function exerciseOf(tx: Tx, workoutExerciseId: string) {
  const row = await tx
    .select({ exercise_id: workoutExercises.exercise_id })
    .from(workoutExercises)
    .where(eq(workoutExercises.id, workoutExerciseId))
    .get();
  return row?.exercise_id ?? '';
}

/**
 * Replaces the exercise of a running workout entry and clears its logged sets. Targets reset
 * when switching between reps and seconds, since "8–12" means something else for a plank.
 */
export async function swapWorkoutExercise(workoutExerciseId: string, exerciseId: string) {
  await drizzle.transaction(async (tx) => {
    const previous = await exerciseOf(tx, workoutExerciseId);
    await tx
      .update(workoutExercises)
      .set({ exercise_id: exerciseId })
      .where(eq(workoutExercises.id, workoutExerciseId));
    const targets = isTimed(previous) !== isTimed(exerciseId) ? defaultTargets(exerciseId) : null;
    await tx
      .update(workoutSets)
      .set({
        weight_kg: null,
        reps: null,
        seconds: null,
        completed_at: null,
        is_pr: false,
        ...(targets && {
          target_min: targets.min,
          target_max: targets.max,
          target_rir: targets.rir,
        }),
      })
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
    const targets = last
      ? { min: last.target_min ?? 8, max: last.target_max ?? 12, rir: last.target_rir }
      : defaultTargets(await exerciseOf(tx, workoutExerciseId));
    await insertWorkoutSet(tx, userId, workoutExerciseId, (last?.position ?? -1) + 1, targets);
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
