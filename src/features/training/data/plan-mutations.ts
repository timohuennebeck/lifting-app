import { eq } from 'drizzle-orm';

import { drizzle } from '@/shared/data/powersync/database';
import { plans, profiles, routines } from '@/shared/data/powersync/schema';

import { deleteRoutineTx } from './routine-mutations';

export async function renamePlan(planId: string, name: string) {
  await drizzle.update(plans).set({ name: name.trim() }).where(eq(plans.id, planId));
}

/** Makes the plan the one Today follows. */
export async function activatePlan(userId: string, planId: string) {
  await drizzle.update(profiles).set({ active_plan_id: planId }).where(eq(profiles.id, userId));
}

export async function setSessionsPerWeek(planId: string, sessionsPerWeek: number) {
  await drizzle
    .update(plans)
    .set({ sessions_per_week: sessionsPerWeek })
    .where(eq(plans.id, planId));
}

/**
 * Turns blocks on (`blockWeeks` with the deload) or off (null). A new block starts with the
 * plan week now, so turning them on never lands in a deload.
 */
export async function setBlockWeeks(planId: string, blockWeeks: number | null, planWeek: number) {
  await drizzle
    .update(plans)
    .set({ block_weeks: blockWeeks, block_start_week: planWeek })
    .where(eq(plans.id, planId));
}

/** Starts the plan's block over with the plan week now as its first week. */
export async function restartBlock(planId: string, planWeek: number) {
  await drizzle.update(plans).set({ block_start_week: planWeek }).where(eq(plans.id, planId));
}

/**
 * Makes the plan week now the deload: the next block starts with the week after it, so this
 * one is the last week of the block before (see `blockWeekOf`).
 */
export async function deloadNow(planId: string, planWeek: number) {
  await drizzle
    .update(plans)
    .set({ block_start_week: planWeek + 1 })
    .where(eq(plans.id, planId));
}

/** Deletes the plan with its routines; logged workouts stay in the history. */
export async function deletePlan(planId: string) {
  await drizzle.transaction(async (tx) => {
    const inside = await tx
      .select({ id: routines.id })
      .from(routines)
      .where(eq(routines.plan_id, planId));
    for (const routine of inside) await deleteRoutineTx(tx, routine.id);
    await tx
      .update(profiles)
      .set({ active_plan_id: null })
      .where(eq(profiles.active_plan_id, planId));
    await tx.delete(plans).where(eq(plans.id, planId));
  });
}
