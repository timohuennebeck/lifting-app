import { and, asc, desc, eq, inArray, isNull } from 'drizzle-orm';

import { defaultTargets, swapTargets } from '@/shared/data/exercises';
import { drizzle, type Tx } from '@/shared/data/powersync/database';
import { workoutEntriesExercises, workoutEntriesSets } from '@/shared/data/powersync/schema';
import type { PlanSetDraft } from '@/shared/data/routines';
import { insertWorkoutSet } from '@/shared/data/workouts';
import type { SetValues } from '@/shared/lib/format';
import { clamp } from '@/shared/lib/math';

async function exerciseOf(tx: Tx, workoutExerciseId: string) {
  const row = await tx
    .select({ exercise_id: workoutEntriesExercises.exercise_id })
    .from(workoutEntriesExercises)
    .where(eq(workoutEntriesExercises.id, workoutExerciseId))
    .get();
  return row?.exercise_id ?? '';
}

/** Replaces the exercise of a running workout entry and clears its logged sets. */
export async function swapWorkoutExercise(workoutExerciseId: string, exerciseId: string) {
  await drizzle.transaction(async (tx) => {
    const previous = await exerciseOf(tx, workoutExerciseId);
    await tx
      .update(workoutEntriesExercises)
      .set({ exercise_id: exerciseId })
      .where(eq(workoutEntriesExercises.id, workoutExerciseId));
    const targets = swapTargets(previous, exerciseId);
    await tx
      .update(workoutEntriesSets)
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
      .where(eq(workoutEntriesSets.workout_entries_exercise_id, workoutExerciseId));
  });
}

/** Appends a set that copies the targets of the current last set. */
export async function addWorkoutSet(userId: string, workoutExerciseId: string) {
  // One write transaction, so a quick double tap cannot reuse the same position.
  await drizzle.transaction(async (tx) => {
    const last = await tx
      .select({
        position: workoutEntriesSets.position,
        target_min: workoutEntriesSets.target_min,
        target_max: workoutEntriesSets.target_max,
        target_rir: workoutEntriesSets.target_rir,
      })
      .from(workoutEntriesSets)
      .where(eq(workoutEntriesSets.workout_entries_exercise_id, workoutExerciseId))
      .orderBy(desc(workoutEntriesSets.position))
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
    .update(workoutEntriesSets)
    .set({
      ...('weightKg' in values ? { weight_kg: values.weightKg } : {}),
      ...('reps' in values ? { reps: values.reps } : {}),
      ...('seconds' in values ? { seconds: values.seconds } : {}),
    })
    .where(and(eq(workoutEntriesSets.id, setId), isNull(workoutEntriesSets.completed_at)));
}

/** Marks a logged set as open again; its values stay as the prefill. */
export async function unlogSet(setId: string) {
  await drizzle
    .update(workoutEntriesSets)
    .set({ completed_at: null, is_pr: false })
    .where(eq(workoutEntriesSets.id, setId));
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
      .select({ id: workoutEntriesSets.id })
      .from(workoutEntriesSets)
      .where(eq(workoutEntriesSets.workout_entries_exercise_id, workoutExerciseId));
    const existing = new Set(rows.map((r) => r.id));
    const kept = new Set(drafts.map((d) => d.key));
    const removed = [...existing].filter((id) => !kept.has(id));
    if (removed.length)
      await tx.delete(workoutEntriesSets).where(inArray(workoutEntriesSets.id, removed));
    for (const [position, d] of drafts.entries()) {
      const target = { min: d.targetMin, max: d.targetMax, rir: d.rir };
      if (existing.has(d.key)) {
        await tx
          .update(workoutEntriesSets)
          .set({ position, target_min: target.min, target_max: target.max, target_rir: target.rir })
          .where(eq(workoutEntriesSets.id, d.key));
      } else {
        await insertWorkoutSet(tx, userId, workoutExerciseId, position, target);
      }
    }
    await tx
      .update(workoutEntriesExercises)
      .set({ rest_seconds: restSeconds })
      .where(eq(workoutEntriesExercises.id, workoutExerciseId));
  });
}

/** Deletes one set of a running workout (swiped away). */
export async function removeWorkoutSet(setId: string) {
  await drizzle.delete(workoutEntriesSets).where(eq(workoutEntriesSets.id, setId));
}

/** Takes an exercise out of a running workout, with its sets (logged or not). */
export async function removeWorkoutExercise(workoutExerciseId: string) {
  await drizzle.transaction(async (tx) => {
    await tx
      .delete(workoutEntriesSets)
      .where(eq(workoutEntriesSets.workout_entries_exercise_id, workoutExerciseId));
    await tx
      .delete(workoutEntriesExercises)
      .where(eq(workoutEntriesExercises.id, workoutExerciseId));
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
      .select({ id: workoutEntriesExercises.id, position: workoutEntriesExercises.position })
      .from(workoutEntriesExercises)
      .where(eq(workoutEntriesExercises.workout_entries_id, workoutId))
      .orderBy(asc(workoutEntriesExercises.position));
    const ids = rows.map((r) => r.id);
    if (!ids.includes(workoutExerciseId)) return;
    const order = ids.filter((id) => id !== workoutExerciseId);
    order.splice(clamp(toIndex, 0, order.length), 0, workoutExerciseId);
    // Only rows whose position changes: every write is queued for upload.
    const stored = new Map(rows.map((r) => [r.id, r.position]));
    for (const [position, id] of order.entries()) {
      if (stored.get(id) === position) continue;
      await tx
        .update(workoutEntriesExercises)
        .set({ position })
        .where(eq(workoutEntriesExercises.id, id));
    }
  });
}
