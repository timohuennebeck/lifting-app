import { and, asc, desc, eq, inArray, isNotNull, isNull, ne, type SQL, sql } from 'drizzle-orm';

import type { SetDraft } from '@/features/training/components/set-editor-row';
import {
  defaultTargets,
  newExerciseDraft,
  type SetTargets,
  swapTargets,
} from '@/shared/data/exercises';
import { newId, nowIso } from '@/shared/data/json';
import { blockWeekOf, currentPlanWeek, setsForWeek } from '@/shared/data/plans';
import { nextPosition } from '@/shared/data/positions';
import { drizzle, type Tx } from '@/shared/data/powersync/database';
import {
  plans,
  routineExercises,
  routines,
  routineSets,
  workoutEntries,
  workoutEntriesExercises,
  workoutEntriesSets,
} from '@/shared/data/powersync/schema';
import type { ExerciseDraft } from '@/shared/data/routines';
import { hasKnownWeight, setScoreSql } from '@/shared/data/workouts';
import type { SetValues } from '@/shared/lib/format';
import { clamp } from '@/shared/lib/math';

/** Subquery with the ids of a workout's exercises, for `inArray(…)`. */
const workoutExerciseIds = (workoutId: string) =>
  drizzle
    .select({ id: workoutEntriesExercises.id })
    .from(workoutEntriesExercises)
    .where(eq(workoutEntriesExercises.workout_entries_id, workoutId));

/** Copies a routine into a new running workout (an empty one starts with `startDraftWorkout`). */
export async function startWorkout(userId: string, name: string, routineId: string) {
  return drizzle.transaction((tx) => insertWorkout(tx, userId, name, routineId));
}

/**
 * Starts a workout with exercises and target sets put together beforehand (an empty workout,
 * which isn't a routine). Returns the new workout id.
 */
export async function startDraftWorkout(userId: string, name: string, exercises: ExerciseDraft[]) {
  return drizzle.transaction(async (tx) => {
    const workoutId = await insertWorkout(tx, userId, name, null);
    for (const [position, exercise] of exercises.entries()) {
      await insertWorkoutExercise(tx, userId, workoutId, position, exercise);
    }
    return workoutId;
  });
}

/** The plan of a routine, if it has one, with its week and block settings. */
async function planOf(tx: Tx, routineId: string) {
  const row = await tx
    .select({
      id: plans.id,
      sessionsPerWeek: plans.sessions_per_week,
      blockWeeks: plans.block_weeks,
      blockStartWeek: plans.block_start_week,
    })
    .from(routines)
    .innerJoin(plans, eq(plans.id, routines.plan_id))
    .where(eq(routines.id, routineId))
    .get();
  return row ?? null;
}

/**
 * Inserts a running workout, a copy of routine `routineId` or (null) an empty one. Returns its
 * id. A routine of a plan counts for the plan's current week, and its sets get that week's
 * targets (see `setsForWeek`).
 */
async function insertWorkout(tx: Tx, userId: string, name: string, routineId: string | null) {
  const workoutId = newId();
  const now = nowIso();
  const plan = routineId ? await planOf(tx, routineId) : null;
  // Before the insert, which would count itself.
  const planWeek = plan ? await currentPlanWeek(tx, plan.id, plan.sessionsPerWeek) : null;
  await tx.insert(workoutEntries).values({
    id: workoutId,
    user_id: userId,
    routine_id: routineId,
    plan_id: plan?.id ?? null,
    plan_week: planWeek,
    name,
    started_at: now,
    created_at: now,
  });
  if (!routineId) return workoutId;
  const blockWeek = plan && planWeek ? blockWeekOf(planWeek, plan) : null;
  const exercises = await tx.query.routineExercises.findMany({
    where: eq(routineExercises.routine_id, routineId),
    orderBy: asc(routineExercises.position),
    with: { sets: { orderBy: asc(routineSets.position) } },
  });
  for (const te of exercises) {
    const workoutExerciseId = newId();
    await tx.insert(workoutEntriesExercises).values({
      id: workoutExerciseId,
      user_id: userId,
      workout_entries_id: workoutId,
      exercise_id: te.exercise_id,
      position: te.position,
      rest_seconds: te.rest_seconds,
    });
    const sets = setsForWeek(te.sets, blockWeek, { blockWeeks: plan?.blockWeeks ?? null });
    if (!sets.length) continue;
    // The routine's targets for this week become the workout's empty sets.
    await tx.insert(workoutEntriesSets).values(
      sets.map((set) => ({
        id: newId(),
        user_id: userId,
        workout_entries_exercise_id: workoutExerciseId,
        position: set.position,
        target_min: set.target_min,
        target_max: set.target_max,
        target_rir: set.rir,
        is_pr: false,
      })),
    );
  }
  return workoutId;
}

/** Inserts one empty set with the given targets. */
async function insertWorkoutSet(
  tx: Tx,
  userId: string,
  workoutExerciseId: string,
  position: number,
  target: SetTargets,
) {
  await tx.insert(workoutEntriesSets).values({
    id: newId(),
    user_id: userId,
    workout_entries_exercise_id: workoutExerciseId,
    position,
    target_min: target.min,
    target_max: target.max,
    target_rir: target.rir,
    is_pr: false,
  });
}

/** Adds an exercise with one empty set per target; `position` may be a `nextPosition` subquery. */
async function insertWorkoutExercise(
  tx: Tx,
  userId: string,
  workoutId: string,
  position: number | SQL<number>,
  exercise: ExerciseDraft,
) {
  const id = newId();
  await tx.insert(workoutEntriesExercises).values({
    id,
    user_id: userId,
    workout_entries_id: workoutId,
    exercise_id: exercise.exerciseId,
    position,
    rest_seconds: exercise.restSeconds ?? null,
  });
  for (const [k, set] of exercise.sets.entries()) {
    await insertWorkoutSet(tx, userId, id, k, {
      min: set.targetMin,
      max: set.targetMax,
      rir: set.rir,
    });
  }
}

/** Appends an exercise with empty sets at its default targets to a running workout. */
export async function addWorkoutExercise(userId: string, workoutId: string, exerciseId: string) {
  await drizzle.transaction((tx) =>
    insertWorkoutExercise(
      tx,
      userId,
      workoutId,
      nextPosition(
        workoutEntriesExercises.position,
        eq(workoutEntriesExercises.workout_entries_id, workoutId),
      ),
      newExerciseDraft(exerciseId),
    ),
  );
}

/** Whether `values` beat every other completed set of the exercise; the first set never does. */
async function isRecord(setId: string, exerciseId: string, values: SetValues) {
  const logged = {
    weight_kg: sql`${values.weightKg}`,
    reps: sql`${values.reps}`,
    seconds: sql`${values.seconds}`,
  };
  const [row] = await drizzle
    .select({
      best: sql<number | null>`max(${setScoreSql(workoutEntriesSets, workoutEntriesExercises)})`,
      score: setScoreSql(logged, { exercise_id: sql`${exerciseId}` }),
    })
    .from(workoutEntriesSets)
    .innerJoin(
      workoutEntriesExercises,
      eq(workoutEntriesExercises.id, workoutEntriesSets.workout_entries_exercise_id),
    )
    .where(
      and(
        eq(workoutEntriesExercises.exercise_id, exerciseId),
        isNotNull(workoutEntriesSets.completed_at),
        hasKnownWeight(workoutEntriesSets, workoutEntriesExercises),
        ne(workoutEntriesSets.id, setId),
      ),
    );
  return !!row?.best && row.score > row.best + 0.01;
}

/** Completes (or re-edits) a set. Returns true when it is a new personal record. */
export async function logSet(setId: string, exerciseId: string, values: SetValues) {
  const isPr = await isRecord(setId, exerciseId, values);
  await drizzle
    .update(workoutEntriesSets)
    .set({
      weight_kg: values.weightKg,
      reps: values.reps,
      seconds: values.seconds,
      is_pr: isPr,
      // A re-edit keeps the original completion time.
      completed_at: sql`coalesce(${workoutEntriesSets.completed_at}, ${nowIso()})`,
    })
    .where(eq(workoutEntriesSets.id, setId));
  return isPr;
}

export async function finishWorkout(workoutId: string) {
  await drizzle.transaction(async (tx) => {
    // Unlogged sets are dropped so history only holds real work.
    await tx
      .delete(workoutEntriesSets)
      .where(
        and(
          isNull(workoutEntriesSets.completed_at),
          inArray(workoutEntriesSets.workout_entries_exercise_id, workoutExerciseIds(workoutId)),
        ),
      );
    await tx
      .update(workoutEntries)
      .set({ finished_at: nowIso() })
      .where(eq(workoutEntries.id, workoutId));
  });
}

/** Local SQLite views have no FK cascades, so children are removed explicitly. */
export async function discardWorkout(workoutId: string) {
  await drizzle.transaction(async (tx) => {
    await tx
      .delete(workoutEntriesSets)
      .where(
        inArray(workoutEntriesSets.workout_entries_exercise_id, workoutExerciseIds(workoutId)),
      );
    await tx
      .delete(workoutEntriesExercises)
      .where(eq(workoutEntriesExercises.workout_entries_id, workoutId));
    await tx.delete(workoutEntries).where(eq(workoutEntries.id, workoutId));
  });
}

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

/**
 * Saves the targets page of a running workout exercise: updates kept sets (logged values stay),
 * adds new rows, deletes removed ones and stores the rest override. A row's `key` is the set's
 * id for sets that already exist.
 */
export async function saveWorkoutTargets(
  userId: string,
  workoutExerciseId: string,
  drafts: SetDraft[],
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
