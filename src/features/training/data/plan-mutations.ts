import { eq } from 'drizzle-orm';

import { blockWeekOf, isDeloadWeek, type PlanSummary } from '@/shared/data/plans';
import { drizzle } from '@/shared/data/powersync/database';
import { plans, profiles, routines, workoutEntries } from '@/shared/data/powersync/schema';

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

type BlockPlan = Pick<PlanSummary, 'id' | 'blockWeeks' | 'blockStartWeek'>;

/**
 * The block start that puts plan week `planWeek` in week `blockWeek` of a block. Starts a whole
 * block apart mean the same (see `blockWeekOf`), so it is moved up to 1 at least, as the database
 * requires.
 */
function blockStart(planWeek: number, blockWeek: number, blockWeeks: number) {
  const start = planWeek - blockWeek + 1;
  return start >= 1 ? start : start + Math.ceil((1 - start) / blockWeeks) * blockWeeks;
}

async function setBlockStart(planId: string, start: number) {
  await drizzle.update(plans).set({ block_start_week: start }).where(eq(plans.id, planId));
}

/**
 * Turns blocks on (`blockWeeks` with the deload), changes their length, or turns them off (null).
 * Turned on, a block starts with the plan week now; a new length keeps the week the block is in
 * (a deload stays one).
 */
export async function setBlockWeeks(plan: BlockPlan, blockWeeks: number | null, planWeek: number) {
  if (blockWeeks === plan.blockWeeks) return;
  const current = blockWeekOf(planWeek, plan);
  let week = 1;
  if (current !== null && blockWeeks !== null) {
    week = isDeloadWeek(current, plan) ? blockWeeks : Math.min(current, blockWeeks);
  }
  await drizzle
    .update(plans)
    .set({
      block_weeks: blockWeeks,
      ...(blockWeeks ? { block_start_week: blockStart(planWeek, week, blockWeeks) } : {}),
    })
    .where(eq(plans.id, plan.id));
}

/** Starts the plan's block over with the plan week now as its first week. */
export async function restartBlock(plan: BlockPlan, planWeek: number) {
  if (plan.blockWeeks) await setBlockStart(plan.id, blockStart(planWeek, 1, plan.blockWeeks));
}

/** Makes the plan week now the deload, the last week of its block. */
export async function deloadNow(plan: BlockPlan, planWeek: number) {
  if (plan.blockWeeks) {
    await setBlockStart(plan.id, blockStart(planWeek, plan.blockWeeks, plan.blockWeeks));
  }
}

/** Deletes the plan with its routines; logged workouts stay in the history, without the plan. */
export async function deletePlan(planId: string) {
  await drizzle.transaction(async (tx) => {
    const inside = await tx
      .select({ id: routines.id })
      .from(routines)
      .where(eq(routines.plan_id, planId));
    for (const routine of inside) await deleteRoutineTx(tx, routine.id);
    // As the server's ON DELETE SET NULL does; they keep their plan week.
    await tx
      .update(workoutEntries)
      .set({ plan_id: null })
      .where(eq(workoutEntries.plan_id, planId));
    await tx
      .update(profiles)
      .set({ active_plan_id: null })
      .where(eq(profiles.active_plan_id, planId));
    await tx.delete(plans).where(eq(plans.id, planId));
  });
}
