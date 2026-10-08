import { db } from '@/shared/data/powersync/database';
import { insertWorkoutSet, type SetTargets } from '@/shared/data/workouts';

/** Replaces the exercise of a running workout entry and clears its logged sets. */
export async function swapWorkoutExercise(workoutExerciseId: string, exerciseId: string) {
  await db.writeTransaction(async (tx) => {
    await tx.execute('UPDATE workout_exercises SET exercise_id = ? WHERE id = ?', [
      exerciseId,
      workoutExerciseId,
    ]);
    await tx.execute(
      `UPDATE workout_sets SET weight_kg = NULL, reps = NULL, completed_at = NULL, is_pr = 0
       WHERE workout_exercise_id = ?`,
      [workoutExerciseId],
    );
  });
}

/** Appends a set that copies the targets of the current last set. */
export async function addWorkoutSet(userId: string, workoutExerciseId: string) {
  const last = await db.getOptional<{
    position: number;
    target_min: number | null;
    target_max: number | null;
    target_rir: number | null;
  }>(
    `SELECT position, target_min, target_max, target_rir FROM workout_sets
     WHERE workout_exercise_id = ? ORDER BY position DESC LIMIT 1`,
    [workoutExerciseId],
  );
  await insertWorkoutSet(db, userId, workoutExerciseId, (last?.position ?? -1) + 1, {
    min: last?.target_min ?? 8,
    max: last?.target_max ?? 12,
    rir: last?.target_rir ?? 2,
  });
}

export async function removeWorkoutSet(setId: string) {
  await db.execute('DELETE FROM workout_sets WHERE id = ?', [setId]);
}

/** Marks a logged set as open again; its values stay as the prefill. */
export async function unlogSet(setId: string) {
  await db.execute('UPDATE workout_sets SET completed_at = NULL, is_pr = 0 WHERE id = ?', [setId]);
}

export async function updateSetTargets(setId: string, { min, max, rir }: SetTargets) {
  await db.execute(
    'UPDATE workout_sets SET target_min = ?, target_max = ?, target_rir = ? WHERE id = ?',
    [min, max, rir, setId],
  );
}
