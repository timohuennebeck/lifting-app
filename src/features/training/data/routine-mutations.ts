import { asc, eq, inArray } from 'drizzle-orm';

import type { SpokenExercises } from '@/features/voice-input/lib/spoken-exercises';
import { insertCustomExercises } from '@/shared/data/custom-exercises';
import { newExerciseDraft } from '@/shared/data/exercises';
import { nowIso } from '@/shared/data/json';
import { syncSessionsPerWeek } from '@/shared/data/plans';
import { nextPosition } from '@/shared/data/positions';
import { drizzle, type Tx } from '@/shared/data/powersync/database';
import { writePositions } from '@/shared/data/reorder';
import { moved } from '@/shared/lib/array';
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
  swapInRoutines,
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

/**
 * Local SQLite views have no FK cascades, so children are removed explicitly. A plan's workouts
 * a week follow its routines.
 */
async function deleteRoutineTx(tx: Tx, routineId: string) {
  const routine = await tx
    .select({ plan_id: routines.plan_id })
    .from(routines)
    .where(eq(routines.id, routineId))
    .get();
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
  if (routine?.plan_id) await syncSessionsPerWeek(tx, routine.plan_id);
}

/** A routine's exercises with their stored positions, in order. */
const exercisePositions = (tx: Tx, routineId: string) =>
  tx
    .select({ id: routineExercises.id, position: routineExercises.position })
    .from(routineExercises)
    .where(eq(routineExercises.routine_id, routineId))
    .orderBy(routineExercises.position);

/** Saves a routine's exercises (`rows`) in `order`, closing gaps in their positions too. */
async function writeExerciseOrder(
  tx: Tx,
  rows: { id: string; position: number }[],
  order: string[],
) {
  await writePositions(rows, order, (id, position) =>
    tx.update(routineExercises).set({ position }).where(eq(routineExercises.id, id)),
  );
}

/** A new empty routine at the end of a plan, or of the library for `null`. */
export async function createRoutine(userId: string, name: string, planId: string | null) {
  return drizzle.transaction(async (tx) => {
    const id = await insertRoutine(tx, userId, planId, name);
    if (planId) await syncSessionsPerWeek(tx, planId);
    return id;
  });
}

export async function renameRoutine(routineId: string, name: string) {
  await drizzle
    .update(routines)
    .set({ name: name.trim(), updated_at: nowIso() })
    .where(eq(routines.id, routineId));
}

/**
 * Puts a plan's routine at slot `target` of the plan (dragged there on Training); the others close
 * up around it.
 */
export async function reorderPlanRoutine(routineId: string, target: number) {
  await drizzle.transaction(async (tx) => {
    const routine = await tx
      .select({ plan_id: routines.plan_id })
      .from(routines)
      .where(eq(routines.id, routineId))
      .get();
    if (!routine?.plan_id) return;
    const rows = await tx
      .select({ id: routines.id, position: routines.position })
      .from(routines)
      .where(eq(routines.plan_id, routine.plan_id))
      .orderBy(routines.position);
    const ids = rows.map((r) => r.id);
    const from = ids.indexOf(routineId);
    if (from < 0 || target < 0 || target >= ids.length) return;
    await writePositions(rows, moved(ids, from, target), (id, position) =>
      tx.update(routines).set({ position }).where(eq(routines.id, id)),
    );
  });
}

export async function deleteRoutine(routineId: string) {
  await drizzle.transaction((tx) => deleteRoutineTx(tx, routineId));
}

/** Deletes a routine that has no exercises (one made and left untouched); else leaves it. */
export async function deleteRoutineIfEmpty(routineId: string) {
  await drizzle.transaction(async (tx) => {
    const exercise = await tx
      .select({ id: routineExercises.id })
      .from(routineExercises)
      .where(eq(routineExercises.routine_id, routineId))
      .get();
    if (!exercise) await deleteRoutineTx(tx, routineId);
  });
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
    if (planId) await syncSessionsPerWeek(tx, planId);
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

/** Appends exercises the user said, with their sets, creating the ones the catalog lacks. */
export async function addSpokenExercises(
  userId: string,
  routineId: string,
  { exercises, newExercises }: SpokenExercises,
) {
  await drizzle.transaction(async (tx) => {
    await insertCustomExercises(tx, userId, newExercises);
    for (const exercise of exercises) {
      const position = nextPosition(
        routineExercises.position,
        eq(routineExercises.routine_id, routineId),
      );
      await insertRoutineExercise(tx, userId, routineId, position, exercise);
    }
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
    await swapInRoutines(tx, [routineExerciseId], previous?.exercise_id ?? '', exerciseId);
    await touchRoutine(tx, await routineOf(tx, routineExerciseId));
  });
}

export async function removeRoutineExercise(routineExerciseId: string) {
  await drizzle.transaction(async (tx) => {
    const routineId = await routineOf(tx, routineExerciseId);
    await tx.delete(routineSets).where(eq(routineSets.routine_exercise_id, routineExerciseId));
    await tx.delete(routineExercises).where(eq(routineExercises.id, routineExerciseId));
    // Closes the gap it leaves.
    const rows = await exercisePositions(tx, routineId);
    const ids = rows.map((r) => r.id);
    await writeExerciseOrder(tx, rows, ids);
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
    const rows = await exercisePositions(tx, routineId);
    const ids = rows.map((r) => r.id);
    const from = ids.indexOf(routineExerciseId);
    const move = from >= 0 && target !== from && target >= 0 && target < ids.length;
    // Gaps in the positions close either way.
    await writeExerciseOrder(tx, rows, move ? moved(ids, from, target) : ids);
    if (move) await touchRoutine(tx, routineId);
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
