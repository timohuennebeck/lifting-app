import { asc, eq, inArray } from 'drizzle-orm';

import { newExerciseDraft, swapTargets } from '@/shared/data/exercises';
import { nowIso } from '@/shared/data/json';
import { nextPosition } from '@/shared/data/positions';
import { drizzle, type Tx } from '@/shared/data/powersync/database';
import {
  routineExercises,
  routines,
  routineSets,
  workoutEntries,
} from '@/shared/data/powersync/schema';
import {
  insertRoutine,
  insertRoutineExercise,
  insertRoutineSets,
  type SetTarget,
} from '@/shared/data/routines';

async function touchRoutine(tx: Tx, routineId: string) {
  await tx.update(routines).set({ updated_at: nowIso() }).where(eq(routines.id, routineId));
}

async function routineOf(tx: Tx, routineExerciseId: string) {
  const row = await tx
    .select({ routine_id: routineExercises.routine_id })
    .from(routineExercises)
    .where(eq(routineExercises.id, routineExerciseId))
    .get();
  if (!row) throw new Error(`Routine exercise ${routineExerciseId} not found`);
  return row.routine_id;
}

/** Local SQLite views have no FK cascades, so children are removed explicitly. */
async function deleteRoutineTx(tx: Tx, routineId: string) {
  const exerciseIds = tx
    .select({ id: routineExercises.id })
    .from(routineExercises)
    .where(eq(routineExercises.routine_id, routineId));
  await tx.delete(routineSets).where(inArray(routineSets.routine_exercise_id, exerciseIds));
  await tx.delete(routineExercises).where(eq(routineExercises.routine_id, routineId));
  await tx
    .update(workoutEntries)
    .set({ routine_id: null })
    .where(eq(workoutEntries.routine_id, routineId));
  await tx.delete(routines).where(eq(routines.id, routineId));
}

async function setExercisePosition(tx: Tx, routineExerciseId: string, position: number) {
  await tx
    .update(routineExercises)
    .set({ position })
    .where(eq(routineExercises.id, routineExerciseId));
}

/** Closes gaps in the exercise positions. Returns the ids in order (index = position). */
async function renumberExercises(tx: Tx, routineId: string) {
  const rows = await tx
    .select({ id: routineExercises.id, position: routineExercises.position })
    .from(routineExercises)
    .where(eq(routineExercises.routine_id, routineId))
    .orderBy(routineExercises.position);
  for (const [position, row] of rows.entries()) {
    // Only rows that are off: every write is queued for upload.
    if (row.position !== position) await setExercisePosition(tx, row.id, position);
  }
  return rows.map((r) => r.id);
}

/** A new empty routine at the end of a plan, or of the library for `null`. */
export async function createRoutine(userId: string, name: string, planId: string | null) {
  return insertRoutine(drizzle, userId, planId, name.trim());
}

export async function renameRoutine(routineId: string, name: string) {
  await drizzle
    .update(routines)
    .set({ name: name.trim(), updated_at: nowIso() })
    .where(eq(routines.id, routineId));
}

/** Saves the order of a plan's routines (or the library's) after a drag. */
export async function reorderRoutines(orderedIds: string[]) {
  await drizzle.transaction(async (tx) => {
    const rows = await tx
      .select({ id: routines.id, position: routines.position })
      .from(routines)
      .where(inArray(routines.id, orderedIds));
    // Only rows whose position changes: every write is queued for upload.
    const stored = new Map(rows.map((r) => [r.id, r.position]));
    for (const [position, id] of orderedIds.entries()) {
      if (stored.get(id) === position) continue;
      await tx.update(routines).set({ position }).where(eq(routines.id, id));
    }
  });
}

export async function deleteRoutine(routineId: string) {
  await drizzle.transaction((tx) => deleteRoutineTx(tx, routineId));
}

/**
 * Copies a routine with its exercises and sets to the end of a plan, or of the library for
 * `null`; the original stays as it is. Returns the copy's id.
 */
export async function copyRoutine(userId: string, routineId: string, planId: string | null) {
  return drizzle.transaction(async (tx) => {
    const source = await tx.query.routines.findFirst({
      where: eq(routines.id, routineId),
      with: {
        exercises: {
          orderBy: asc(routineExercises.position),
          with: { sets: { orderBy: asc(routineSets.position) } },
        },
      },
    });
    if (!source) throw new Error(`Routine ${routineId} not found`);
    const id = await insertRoutine(tx, userId, planId, source.name);
    for (const [position, exercise] of source.exercises.entries()) {
      await insertRoutineExercise(tx, userId, id, position, {
        exerciseId: exercise.exercise_id,
        restSeconds: exercise.rest_seconds,
        sets: exercise.sets.map((set) => ({
          targetMin: set.target_min,
          targetMax: set.target_max,
          rir: set.rir,
        })),
      });
    }
    return id;
  });
}

export async function addRoutineExercise(userId: string, routineId: string, exerciseId: string) {
  await drizzle.transaction(async (tx) => {
    const position = nextPosition(
      routineExercises.position,
      eq(routineExercises.routine_id, routineId),
    );
    await insertRoutineExercise(tx, userId, routineId, position, newExerciseDraft(exerciseId));
    await touchRoutine(tx, routineId);
  });
}

/** Replaces the exercise but keeps its sets and rest time; targets reset per `swapTargets`. */
export async function swapRoutineExercise(routineExerciseId: string, exerciseId: string) {
  await drizzle.transaction(async (tx) => {
    const previous = await tx
      .select({ exercise_id: routineExercises.exercise_id })
      .from(routineExercises)
      .where(eq(routineExercises.id, routineExerciseId))
      .get();
    await tx
      .update(routineExercises)
      .set({ exercise_id: exerciseId })
      .where(eq(routineExercises.id, routineExerciseId));
    const targets = swapTargets(previous?.exercise_id ?? '', exerciseId);
    if (targets) {
      await tx
        .update(routineSets)
        .set({ target_min: targets.min, target_max: targets.max, rir: targets.rir })
        .where(eq(routineSets.routine_exercise_id, routineExerciseId));
    }
    await touchRoutine(tx, await routineOf(tx, routineExerciseId));
  });
}

export async function removeRoutineExercise(routineExerciseId: string) {
  await drizzle.transaction(async (tx) => {
    const routineId = await routineOf(tx, routineExerciseId);
    await tx.delete(routineSets).where(eq(routineSets.routine_exercise_id, routineExerciseId));
    await tx.delete(routineExercises).where(eq(routineExercises.id, routineExerciseId));
    await renumberExercises(tx, routineId);
    await touchRoutine(tx, routineId);
  });
}

/**
 * Puts an exercise at slot `target` of its routine (dragged there, or moved up or down); the
 * others close up around it.
 */
export async function reorderRoutineExercise(routineExerciseId: string, target: number) {
  await drizzle.transaction(async (tx) => {
    const routineId = await routineOf(tx, routineExerciseId);
    const ids = await renumberExercises(tx, routineId);
    const from = ids.indexOf(routineExerciseId);
    if (from < 0 || target === from || target < 0 || target >= ids.length) return;
    const order = ids.filter((id) => id !== routineExerciseId);
    order.splice(target, 0, routineExerciseId);
    for (const [position, id] of order.entries()) {
      if (ids[position] !== id) await setExercisePosition(tx, id, position);
    }
    await touchRoutine(tx, routineId);
  });
}

/** Replaces all target sets of one routine exercise and its rest override. */
export async function saveRoutineSets(
  userId: string,
  routineExerciseId: string,
  sets: SetTarget[],
  restSeconds: number | null,
) {
  await drizzle.transaction(async (tx) => {
    await tx.delete(routineSets).where(eq(routineSets.routine_exercise_id, routineExerciseId));
    await insertRoutineSets(tx, userId, routineExerciseId, sets);
    await tx
      .update(routineExercises)
      .set({ rest_seconds: restSeconds })
      .where(eq(routineExercises.id, routineExerciseId));
    await touchRoutine(tx, await routineOf(tx, routineExerciseId));
  });
}
