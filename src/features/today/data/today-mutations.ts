import { nowIso } from '@/shared/data/json';
import { db } from '@/shared/data/powersync/database';
import { startWorkout } from '@/shared/data/workouts';

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
 * completed with its target reps, dated to `day` at the current time.
 */
export async function markTemplateDone(
  userId: string,
  templateId: string,
  name: string,
  day: Date,
  minutes: number,
) {
  const workoutId = await startWorkout(userId, name, templateId);
  const now = new Date();
  const start = new Date(day);
  start.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
  const end = new Date(start.getTime() + minutes * 60000);
  await db.writeTransaction(async (tx) => {
    await tx.execute(
      `UPDATE workout_sets SET reps = COALESCE(target_max, target_min, 0), completed_at = ?
       WHERE workout_exercise_id IN (SELECT id FROM workout_exercises WHERE workout_id = ?)`,
      [end.toISOString(), workoutId],
    );
    await tx.execute('UPDATE workouts SET started_at = ?, finished_at = ? WHERE id = ?', [
      start.toISOString(),
      end.toISOString(),
      workoutId,
    ]);
  });
  return workoutId;
}
