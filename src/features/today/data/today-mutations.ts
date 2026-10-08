import { nowIso } from '@/shared/data/json';
import { db } from '@/shared/data/powersync/database';
import { insertWorkout } from '@/shared/data/workouts';
import { MINUTE_MS } from '@/shared/lib/date';

/** Moves a template to another Monday-based weekday. */
export async function rescheduleTemplate(templateId: string, weekday: number) {
  await db.execute('UPDATE templates SET weekday = ?, updated_at = ? WHERE id = ?', [
    weekday,
    nowIso(),
    templateId,
  ]);
}

/**
 * Logs a planned template as done without live tracking: every set is
 * completed with its target reps and the exercise's last logged weight,
 * dated to `day` at the current time.
 */
export async function markTemplateDone(
  userId: string,
  templateId: string,
  name: string,
  day: Date,
  minutes: number,
) {
  const now = new Date();
  const start = new Date(day);
  start.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
  const end = new Date(start.getTime() + minutes * MINUTE_MS);
  // One transaction, so the workout never shows up as running or half-written.
  return db.writeTransaction(async (tx) => {
    const workoutId = await insertWorkout(tx, userId, name, templateId);
    await tx.execute(
      `UPDATE workout_sets SET reps = COALESCE(target_max, target_min, 0), completed_at = ?,
         weight_kg = (SELECT p.weight_kg FROM workout_sets p
           JOIN workout_exercises pe ON pe.id = p.workout_exercise_id
           WHERE pe.workout_id != ? AND p.completed_at IS NOT NULL AND p.weight_kg IS NOT NULL
             AND pe.exercise_id =
               (SELECT exercise_id FROM workout_exercises WHERE id = workout_sets.workout_exercise_id)
           ORDER BY p.completed_at DESC LIMIT 1)
       WHERE workout_exercise_id IN (SELECT id FROM workout_exercises WHERE workout_id = ?)`,
      [end.toISOString(), workoutId, workoutId],
    );
    await tx.execute('UPDATE workouts SET started_at = ?, finished_at = ? WHERE id = ?', [
      start.toISOString(),
      end.toISOString(),
      workoutId,
    ]);
    return workoutId;
  });
}
