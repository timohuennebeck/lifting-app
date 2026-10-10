import { and, asc, desc, eq, inArray, isNull } from 'drizzle-orm';

import { defaultTargets, swapTargets } from '@/shared/data/exercises';
import { drizzle, type Tx } from '@/shared/data/powersync/database';
import { workoutExercises, workoutSets } from '@/shared/data/powersync/schema';
import type { PlanSetDraft } from '@/shared/data/templates';
import type { SetValues } from '@/shared/lib/format';
import { insertWorkoutSet } from '@/shared/data/workouts';

async function exerciseOf(tx: Tx, workoutExerciseId: string) {
  const row = await tx
    .select({ exercise_id: workoutExercises.exercise_id })
    .from(workoutExercises)
    .where(eq(workoutExercises.id, workoutExerciseId))
    .get();
  return row?.exercise_id ?? '';
}

/** Replaces the exercise of a running workout entry and clears its logged sets. */
export async function swapWorkoutExercise(workoutExerciseId: string, exerciseId: string) {
  await drizzle.transaction(async (tx) => {
    const previous = await exerciseOf(tx, workoutExerciseId);
    await tx
      .update(workoutExercises)
      .set({ exercise_id: exerciseId })
      .where(eq(workoutExercises.id, workoutExerciseId));
    const targets = swapTargets(previous, exerciseId);
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
      ? { min: last.target_min, max: last.target_max, rir: last.target_rir }
      : defaultTargets(await exerciseOf(tx, workoutExerciseId));
    await insertWorkoutSet(tx, userId, workoutExerciseId, (last?.position ?? -1) + 1, targets);
  });
}

/** Keeps values typed into an open set without logging it (the keypad closed before the check). */
export async function saveOpenSetValues(setId: string, values: Partial<SetValues>) {
  await drizzle
    .update(workoutSets)
    .set({
      ...('weightKg' in values ? { weight_kg: values.weightKg } : {}),
      ...('reps' in values ? { reps: values.reps } : {}),
      ...('seconds' in values ? { seconds: values.seconds } : {}),
    })
    .where(and(eq(workoutSets.id, setId), isNull(workoutSets.completed_at)));
}

/** Marks a logged set as open again; its values stay as the prefill. */
export async function unlogSet(setId: string) {
  await drizzle
    .update(workoutSets)
    .set({ completed_at: null, is_pr: false })
    .where(eq(workoutSets.id, setId));
}

/** A target row of the running workout; `key` is the set's id for rows that already exist. */
export interface WorkoutTargetDraft extends PlanSetDraft {
  key: string;
}

/**
 * Saves the targets page of a running workout exercise: updates kept sets (logged values stay),
 * adds new rows, deletes removed ones and stores the rest override.
 */
export async function saveWorkoutTargets(
  userId: string,
  workoutExerciseId: string,
  drafts: WorkoutTargetDraft[],
  restSeconds: number | null,
) {
  await drizzle.transaction(async (tx) => {
    const rows = await tx
      .select({ id: workoutSets.id })
      .from(workoutSets)
      .where(eq(workoutSets.workout_exercise_id, workoutExerciseId));
    const existing = new Set(rows.map((r) => r.id));
    const kept = new Set(drafts.map((d) => d.key));
    const removed = [...existing].filter((id) => !kept.has(id));
    if (removed.length) await tx.delete(workoutSets).where(inArray(workoutSets.id, removed));
    for (const [position, d] of drafts.entries()) {
      const target = { min: d.targetMin, max: d.targetMax, rir: d.rir };
      if (existing.has(d.key)) {
        await tx
          .update(workoutSets)
          .set({ position, target_min: target.min, target_max: target.max, target_rir: target.rir })
          .where(eq(workoutSets.id, d.key));
      } else {
        await insertWorkoutSet(tx, userId, workoutExerciseId, position, target);
      }
    }
    await tx
      .update(workoutExercises)
      .set({ rest_seconds: restSeconds })
      .where(eq(workoutExercises.id, workoutExerciseId));
  });
}

/** Drops a workout exercise at `toIndex` (drag and drop in the exercise strip). */
export async function reorderWorkoutExercise(
  workoutId: string,
  workoutExerciseId: string,
  toIndex: number,
) {
  await drizzle.transaction(async (tx) => {
    const rows = await tx
      .select({ id: workoutExercises.id })
      .from(workoutExercises)
      .where(eq(workoutExercises.workout_id, workoutId))
      .orderBy(asc(workoutExercises.position));
    const ids = rows.map((r) => r.id);
    if (!ids.includes(workoutExerciseId)) return;
    const order = ids.filter((id) => id !== workoutExerciseId);
    order.splice(Math.min(Math.max(toIndex, 0), order.length), 0, workoutExerciseId);
    for (const [position, id] of order.entries()) {
      await tx.update(workoutExercises).set({ position }).where(eq(workoutExercises.id, id));
    }
  });
}
