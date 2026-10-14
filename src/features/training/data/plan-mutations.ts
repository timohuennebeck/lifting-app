import { eq } from 'drizzle-orm';

import { blockWeekOf, isDeloadWeek } from '@/shared/data/plans';
import { drizzle } from '@/shared/data/powersync/database';
import { plans, profiles, routines, workoutEntries } from '@/shared/data/powersync/schema';

import { deleteRoutineTx } from './routine-mutations';

export async function renamePlan(planId: string, name: string) {
  await drizzle.update(plans).set({ name: name.trim() }).where(eq(plans.id, planId));
}

export async function setSessionsPerWeek(planId: string, sessionsPerWeek: number) {
  await drizzle
    .update(plans)
    .set({ sessions_per_week: sessionsPerWeek })
    .where(eq(plans.id, planId));
}

/**
 * The block start that puts plan week `planWeek` in week `blockWeek` of a block. Starts a whole
 * block apart mean the same (see `blockWeekOf`), so it is moved up to 1 at least, as the database
 * requires.
 */
function blockStart(planWeek: number, blockWeek: number, blockWeeks: number) {
  const start = planWeek - blockWeek + 1;
  return start >= 1 ? start : start + Math.ceil((1 - start) / blockWeeks) * blockWeeks;
}

interface Blocks {
  blockWeeks: number | null;
  blockStartWeek: number;
}

/**
 * Changes the plan's blocks from what is stored (not what a screen showed, so quick taps build
 * on each other): `change` gets them and returns the new ones, or null to leave them.
 */
async function changeBlocks(planId: string, change: (blocks: Blocks) => Blocks | null) {
  await drizzle.transaction(async (tx) => {
    const row = await tx
      .select({ blockWeeks: plans.block_weeks, blockStartWeek: plans.block_start_week })
      .from(plans)
      .where(eq(plans.id, planId))
      .get();
    const next = row && change(row);
    if (!next) return;
    await tx
      .update(plans)
      .set({ block_weeks: next.blockWeeks, block_start_week: next.blockStartWeek })
      .where(eq(plans.id, planId));
  });
}

/**
 * Turns blocks on (`blockWeeks` with the deload), changes their length, or turns them off (null).
 * Turned on, a block starts with the plan week now. A new length keeps the week the block is in:
 * a deload stays one, and a build week stays a build week (at most the new last one).
 */
export async function setBlockWeeks(planId: string, blockWeeks: number | null, planWeek: number) {
  await changeBlocks(planId, (block) => {
    if (blockWeeks === block.blockWeeks) return null;
    if (blockWeeks === null) return { ...block, blockWeeks };
    const current = blockWeekOf(planWeek, block);
    let week = 1;
    if (current !== null) {
      week = isDeloadWeek(current, block) ? blockWeeks : Math.min(current, blockWeeks - 1);
    }
    return { blockWeeks, blockStartWeek: blockStart(planWeek, week, blockWeeks) };
  });
}

/** Starts the plan's block over with the plan week now as its first week. */
export async function restartBlock(planId: string, planWeek: number) {
  await changeBlocks(planId, ({ blockWeeks }) =>
    blockWeeks ? { blockWeeks, blockStartWeek: blockStart(planWeek, 1, blockWeeks) } : null,
  );
}

/** Makes the plan week now the deload, the last week of its block. */
export async function deloadNow(planId: string, planWeek: number) {
  await changeBlocks(planId, ({ blockWeeks }) =>
    blockWeeks
      ? { blockWeeks, blockStartWeek: blockStart(planWeek, blockWeeks, blockWeeks) }
      : null,
  );
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
