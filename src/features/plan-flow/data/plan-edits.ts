import { asc, eq, inArray } from 'drizzle-orm';

import type { ImportedPlan } from '@/features/plan-import/lib/plan-import-service';
import { nowIso } from '@/shared/data/json';
import { clampSessions } from '@/shared/data/plans';
import { drizzle, type Executor, type Tx } from '@/shared/data/powersync/database';
import { plans, routineExercises, routines, routineSets } from '@/shared/data/powersync/schema';
import { type ExerciseDraft, insertRoutine, insertRoutineExercise } from '@/shared/data/routines';

/** A plan's routines in their order, each with its exercises and their sets. */
const planRoutinesQuery = (executor: Executor, planId: string) =>
  executor.query.routines.findMany({
    columns: { id: true, name: true, position: true },
    where: eq(routines.plan_id, planId),
    orderBy: asc(routines.position),
    with: {
      exercises: {
        columns: { id: true, exercise_id: true, rest_seconds: true },
        orderBy: asc(routineExercises.position),
        with: {
          sets: {
            columns: { target_min: true, target_max: true, rir: true },
            orderBy: asc(routineSets.position),
          },
        },
      },
    },
  });

type SavedExercise = Awaited<ReturnType<typeof planRoutinesQuery>>[number]['exercises'][number];

const toDrafts = (exercises: SavedExercise[]) =>
  exercises.map((e) => ({
    key: e.id,
    exerciseId: e.exercise_id,
    restSeconds: e.rest_seconds,
    sets: e.sets.map((s) => ({ targetMin: s.target_min, targetMax: s.target_max, rir: s.rir })),
  }));

const fingerprint = (exercises: ExerciseDraft[]) =>
  JSON.stringify(
    exercises.map((e) => [
      e.exerciseId,
      e.restSeconds ?? null,
      e.sets.map((s) => [s.targetMin, s.targetMax, s.rir]),
    ]),
  );

/** A saved plan as the editor (ConfirmScreen) shows it; null once it is gone. */
export async function loadPlanForEditing(planId: string): Promise<ImportedPlan | null> {
  const plan = await drizzle
    .select({ name: plans.name })
    .from(plans)
    .where(eq(plans.id, planId))
    .get();
  if (!plan) return null;
  const saved = await planRoutinesQuery(drizzle, planId);
  return {
    name: plan.name,
    routines: saved.map((r) => ({
      key: r.id,
      routineId: r.id,
      name: r.name,
      exercises: toDrafts(r.exercises),
    })),
    newExercises: [],
  };
}

/** Puts `exercises` in place of a routine's exercises and their sets. */
async function replaceExercises(
  tx: Tx,
  userId: string,
  routineId: string,
  exercises: ExerciseDraft[],
) {
  const ids = tx
    .select({ id: routineExercises.id })
    .from(routineExercises)
    .where(eq(routineExercises.routine_id, routineId));
  await tx.delete(routineSets).where(inArray(routineSets.routine_exercise_id, ids));
  await tx.delete(routineExercises).where(eq(routineExercises.routine_id, routineId));
  for (const [position, exercise] of exercises.entries()) {
    await insertRoutineExercise(tx, userId, routineId, position, exercise);
  }
}

/**
 * Writes the editor's plan back to saved plan `planId`: its name, its routines' names, order and
 * exercises, and the routines added (new ones without exercises are left out, saved ones stay).
 * Saved routines keep their ids, so the workouts done with them still count. A plan with a
 * workout a week per routine keeps that when routines are added.
 */
export async function savePlanEdits(userId: string, planId: string, plan: ImportedPlan) {
  await drizzle.transaction(async (tx) => {
    const current = await tx
      .select({ name: plans.name, sessionsPerWeek: plans.sessions_per_week })
      .from(plans)
      .where(eq(plans.id, planId))
      .get();
    if (!current) throw new Error(`Plan ${planId} not found`);
    const saved = new Map((await planRoutinesQuery(tx, planId)).map((r) => [r.id, r]));
    const kept = plan.routines.filter(
      (r) => (r.routineId && saved.has(r.routineId)) || r.exercises.length,
    );
    const keptIds = new Set(kept.map((r) => r.routineId));
    // Added meanwhile (synced from another phone): they go after the edited ones.
    const others = [...saved.values()].filter((r) => !keptIds.has(r.id));

    for (const [position, routine] of kept.entries()) {
      const before = routine.routineId ? saved.get(routine.routineId) : undefined;
      if (!before) {
        const id = await insertRoutine(tx, userId, planId, routine.name, position);
        await replaceExercises(tx, userId, id, routine.exercises);
        continue;
      }
      // Only what changed: every write is queued for upload.
      const changed = fingerprint(toDrafts(before.exercises)) !== fingerprint(routine.exercises);
      if (changed) await replaceExercises(tx, userId, before.id, routine.exercises);
      if (changed || before.name !== routine.name || before.position !== position) {
        await tx
          .update(routines)
          .set({ name: routine.name, position, updated_at: nowIso() })
          .where(eq(routines.id, before.id));
      }
    }
    for (const [i, routine] of others.entries()) {
      const position = kept.length + i;
      if (routine.position === position) continue;
      await tx.update(routines).set({ position }).where(eq(routines.id, routine.id));
    }

    const name = plan.name.trim() || current.name;
    const count = kept.length + others.length;
    const sessionsPerWeek =
      current.sessionsPerWeek === saved.size ? clampSessions(count) : current.sessionsPerWeek;
    if (name !== current.name || sessionsPerWeek !== current.sessionsPerWeek) {
      await tx
        .update(plans)
        .set({ name, sessions_per_week: sessionsPerWeek })
        .where(eq(plans.id, planId));
    }
  });
}
