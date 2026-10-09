import { and, desc, eq, isNotNull, ne, sql } from 'drizzle-orm';

import { getExercise, measuresOf } from '@/shared/data/exercises';
import { nowIso } from '@/shared/data/json';
import { drizzle } from '@/shared/data/powersync/database';
import { templates, workoutExercises, workouts, workoutSets } from '@/shared/data/powersync/schema';
import { insertWorkout, previousExercise, previousSet } from '@/shared/data/workouts';
import { MINUTE_MS } from '@/shared/lib/date';

/** Moves a template to another Monday-based weekday. */
export async function rescheduleTemplate(templateId: string, weekday: number) {
  await drizzle
    .update(templates)
    .set({ weekday, updated_at: nowIso() })
    .where(eq(templates.id, templateId));
}

/**
 * Last logged weight of the exercise of the set being updated, from any other workout.
 * Correlated subquery for an UPDATE of `workout_sets`.
 */
function lastWeightOutside(workoutId: string) {
  const exerciseOfUpdatedSet = drizzle
    .select({ exercise_id: workoutExercises.exercise_id })
    .from(workoutExercises)
    .where(eq(workoutExercises.id, workoutSets.workout_exercise_id));
  return drizzle
    .select({ weight_kg: previousSet.weight_kg })
    .from(previousSet)
    .innerJoin(previousExercise, eq(previousExercise.id, previousSet.workout_exercise_id))
    .where(
      and(
        ne(previousExercise.workout_id, workoutId),
        isNotNull(previousSet.completed_at),
        isNotNull(previousSet.weight_kg),
        eq(previousExercise.exercise_id, exerciseOfUpdatedSet),
      ),
    )
    .orderBy(desc(previousSet.completed_at))
    .limit(1);
}

/**
 * Logs a planned template as done without live tracking: every set is completed with its
 * target reps (or seconds) and the exercise's last logged weight, dated to `day` at the
 * current time.
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
  return drizzle.transaction(async (tx) => {
    const workoutId = await insertWorkout(tx, userId, name, templateId);
    const target = sql<number>`coalesce(${workoutSets.target_max}, ${workoutSets.target_min})`;
    const exercises = await tx
      .select({ id: workoutExercises.id, exercise_id: workoutExercises.exercise_id })
      .from(workoutExercises)
      .where(eq(workoutExercises.workout_id, workoutId));
    // Each exercise fills only the boxes it has. Bodyweight moves never logged before start at
    // 0 kg extra; other weighted ones stay without weight and are left out of records.
    for (const exercise of exercises) {
      const measures = measuresOf(exercise.exercise_id);
      const fallback = getExercise(exercise.exercise_id)?.equipment === 'bodyweight' ? 0 : null;
      await tx
        .update(workoutSets)
        .set({
          completed_at: end.toISOString(),
          weight_kg: measures.includes('weight')
            ? sql`coalesce((${lastWeightOutside(workoutId)}), ${fallback})`
            : null,
          reps: measures.includes('reps') ? sql`coalesce(${target}, 0)` : null,
          seconds: measures.includes('seconds') ? target : null,
        })
        .where(eq(workoutSets.workout_exercise_id, exercise.id));
    }
    await tx
      .update(workouts)
      .set({ started_at: start.toISOString(), finished_at: end.toISOString() })
      .where(eq(workouts.id, workoutId));
    return workoutId;
  });
}
