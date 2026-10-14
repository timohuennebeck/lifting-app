import { and, count, desc, eq, isNotNull, max, sql } from 'drizzle-orm';

import { insertCustomExercises } from './custom-exercises';
import type { CustomExercise } from './exercises';
import { newId, nowIso } from './json';
import { nextPosition } from './positions';
import { drizzle, type Executor, type Tx } from './powersync/database';
import { plans, routineExercises, routines, workoutEntries } from './powersync/schema';
import { queryKeys } from './query-keys';
import { insertRoutineExercise, type PlanSetDraft, type PlanExerciseDraft } from './routines';
import { type RowOf, useDrizzleQuery } from './use-drizzle-query';

/** A plan's weekly goal when nothing says otherwise. */
export const DEFAULT_SESSIONS_PER_WEEK = 3;
export const MAX_SESSIONS_PER_WEEK = 7;
/** Blocks a plan can run in, in weeks with the deload: 3, 4 or 5 weeks building up, then 1. */
export const BLOCK_OPTIONS = [4, 5, 6] as const;
/** A plan the AI makes: 4 weeks building up, then a deload. */
export const AI_BLOCK_WEEKS = 5;
/** Reps in reserve of every set in a deload week. */
export const DELOAD_RIR = 4;

export interface PlanRoutineDraft {
  name: string;
  exercises: PlanExerciseDraft[];
}

export interface PlanDraft {
  name: string;
  /** In the order they are trained. */
  routines: PlanRoutineDraft[];
  sessionsPerWeek: number;
  /** Weeks of a block with its deload; null: every week the same. */
  blockWeeks: number | null;
}

/** A weekly goal between 1 and 7. */
export const clampSessions = (count: number) =>
  Math.min(Math.max(Math.round(count) || 1, 1), MAX_SESSIONS_PER_WEEK);

/**
 * Writes a plan with its routines inside `tx`, with the exercises of `newExercises` it uses (an
 * imported plan's, which the catalog doesn't have). Returns the plan id.
 */
export async function insertPlan(
  tx: Tx,
  userId: string,
  plan: PlanDraft,
  newExercises: CustomExercise[] = [],
): Promise<string> {
  const used = new Set(plan.routines.flatMap((r) => r.exercises.map((e) => e.exerciseId)));
  await insertCustomExercises(
    tx,
    userId,
    newExercises.filter((e) => used.has(e.id)),
  );
  const planId = await insertPlanRow(tx, userId, plan);
  for (const [index, routine] of plan.routines.entries()) {
    const routineId = newId();
    await tx.insert(routines).values({
      id: routineId,
      user_id: userId,
      plan_id: planId,
      name: routine.name,
      position: index,
      created_at: nowIso(),
      updated_at: nowIso(),
    });
    for (const [position, exercise] of routine.exercises.entries()) {
      await insertRoutineExercise(tx, userId, routineId, position, exercise);
    }
  }
  return planId;
}

/** Appends a plan after the user's last one (`drizzle` or a transaction). Returns its id. */
async function insertPlanRow(
  executor: Executor,
  userId: string,
  plan: Pick<PlanDraft, 'name' | 'sessionsPerWeek' | 'blockWeeks'>,
) {
  const id = newId();
  await executor.insert(plans).values({
    id,
    user_id: userId,
    name: plan.name,
    position: nextPosition(plans.position, eq(plans.user_id, userId)),
    sessions_per_week: clampSessions(plan.sessionsPerWeek),
    block_weeks: plan.blockWeeks,
    block_start_week: 1,
    created_at: nowIso(),
  });
  return id;
}

export interface PlanSummary {
  id: string;
  name: string;
  sessionsPerWeek: number;
  blockWeeks: number | null;
  blockStartWeek: number;
  routineCount: number;
}

const planListQuery = () =>
  drizzle
    .select({
      id: plans.id,
      name: plans.name,
      sessions_per_week: plans.sessions_per_week,
      block_weeks: plans.block_weeks,
      block_start_week: plans.block_start_week,
      routine_count: count(routines.id),
    })
    .from(plans)
    .leftJoin(routines, eq(routines.plan_id, plans.id))
    .groupBy(plans.id)
    .orderBy(plans.position);

const toPlans = (rows: RowOf<typeof planListQuery>[]) =>
  rows.map((r): PlanSummary => ({
    id: r.id,
    name: r.name,
    sessionsPerWeek: r.sessions_per_week,
    blockWeeks: r.block_weeks,
    blockStartWeek: r.block_start_week,
    routineCount: r.routine_count,
  }));

/** All of the user's plans, in their order. */
export function usePlans() {
  return useDrizzleQuery({
    queryKey: queryKeys.plans.list.queryKey,
    query: planListQuery(),
    map: toPlans,
  });
}

/** The plan Today follows and Training shows first: the one marked active, else the first. */
export const currentPlanId = (activeId: string | null | undefined, list: PlanSummary[]) =>
  list.find((p) => p.id === activeId)?.id ?? list[0]?.id ?? null;

export interface PlanWeek {
  /** Plan week now: 1 at the start, one more each time a week's workouts are done. */
  week: number;
  /** Workouts of it done. */
  done: number;
}

/**
 * The plan week a plan is in, from its latest week and how many workouts that week has: it is
 * over once it has the weekly goal, however long that took.
 */
export function planWeekFrom(
  latest: { week: number; count: number } | undefined,
  sessionsPerWeek: number,
): PlanWeek {
  if (!latest) return { week: 1, done: 0 };
  if (latest.count >= sessionsPerWeek) return { week: latest.week + 1, done: 0 };
  return { week: latest.week, done: latest.count };
}

/**
 * Week of the block a plan week falls in (1 to `blockWeeks`, the last one the deload), or null
 * for a plan without blocks.
 */
export function blockWeekOf(
  planWeek: number,
  plan: Pick<PlanSummary, 'blockWeeks' | 'blockStartWeek'>,
) {
  const { blockWeeks, blockStartWeek } = plan;
  if (!blockWeeks) return null;
  const offset = (planWeek - blockStartWeek) % blockWeeks;
  return ((offset + blockWeeks) % blockWeeks) + 1;
}

export const isDeloadWeek = (blockWeek: number | null, plan: Pick<PlanSummary, 'blockWeeks'>) =>
  blockWeek !== null && blockWeek === plan.blockWeeks;

/**
 * A routine's sets for a block week: one rep less in reserve each week after the first (never
 * below 0), and in the deload only the first half of the sets, with DELOAD_RIR in reserve.
 * Sets without reps in reserve (e.g. timed holds) keep none.
 */
export function setsForWeek<TSet extends Pick<PlanSetDraft, 'rir'>>(
  sets: TSet[],
  blockWeek: number | null,
  plan: Pick<PlanSummary, 'blockWeeks'>,
): TSet[] {
  if (blockWeek === null) return sets;
  if (isDeloadWeek(blockWeek, plan)) {
    return sets
      .slice(0, Math.ceil(sets.length / 2))
      .map((set) => (set.rir === null ? set : { ...set, rir: DELOAD_RIR }));
  }
  return sets.map((set) =>
    set.rir === null ? set : { ...set, rir: Math.max(0, set.rir - (blockWeek - 1)) },
  );
}

/**
 * The latest plan week a plan's workouts counted for, with how many it has: all of them for
 * the week a new one takes, the finished ones for what the plan shows.
 */
const latestWeekQuery = (executor: Executor, planId: string, finishedOnly: boolean) =>
  executor
    .select({ week: workoutEntries.plan_week, count: count() })
    .from(workoutEntries)
    .where(
      and(
        eq(workoutEntries.plan_id, planId),
        finishedOnly ? isNotNull(workoutEntries.finished_at) : undefined,
      ),
    )
    .groupBy(workoutEntries.plan_week)
    .orderBy(desc(workoutEntries.plan_week))
    .limit(1);

const toLatest = (rows: RowOf<typeof latestWeekQuery>[]) => {
  const row = rows[0];
  return row?.week ? { week: row.week, count: row.count } : undefined;
};

/** The plan week a workout started now counts for (inside `tx`, so two can't take one place). */
export async function currentPlanWeek(tx: Tx, planId: string, sessionsPerWeek: number) {
  return planWeekFrom(toLatest(await latestWeekQuery(tx, planId, false)), sessionsPerWeek).week;
}

/**
 * Routines of a plan with when each was last done (finished), for the order: when it was logged,
 * so one logged later for an earlier day counts as the latest. Empty ones can't be done.
 */
const lastDoneQuery = (planId: string) =>
  drizzle
    .select({
      id: routines.id,
      position: routines.position,
      last_done: max(workoutEntries.created_at),
      has_exercises: sql<number>`exists (select 1 from ${routineExercises} where ${routineExercises.routine_id} = ${routines.id})`,
    })
    .from(routines)
    .leftJoin(
      workoutEntries,
      and(eq(workoutEntries.routine_id, routines.id), isNotNull(workoutEntries.finished_at)),
    )
    .where(eq(routines.plan_id, planId))
    .groupBy(routines.id);

/**
 * The routine to do next: the one done longest ago, never-done ones first, ties in the plan's
 * order; null while none has exercises. Doing one out of order is fine: the others come next.
 */
function toNextRoutineId(rows: RowOf<typeof lastDoneQuery>[]) {
  const sorted = rows
    .filter((r) => r.has_exercises)
    .sort((a, b) => {
      if (a.last_done === b.last_done) return a.position - b.position;
      if (a.last_done === null) return -1;
      if (b.last_done === null) return 1;
      return a.last_done < b.last_done ? -1 : 1;
    });
  return sorted[0]?.id ?? null;
}

export interface PlanStatus extends PlanWeek {
  /** Week of the block (1 to `blockWeeks`), or null without blocks. */
  blockWeek: number | null;
  deload: boolean;
  nextRoutineId: string | null;
}

/** Where a plan stands: its week, the block week, what's next. Undefined while loading. */
export function usePlanStatus(plan: PlanSummary | undefined): PlanStatus | undefined {
  const planId = plan?.id ?? '';
  const { data: latest, isLoading: weekLoading } = useDrizzleQuery({
    queryKey: queryKeys.plans.latestWeek(planId).queryKey,
    enabled: !!plan,
    query: latestWeekQuery(drizzle, planId, true),
    map: toLatest,
  });
  const { data: nextRoutineId = null, isLoading: nextLoading } = useDrizzleQuery({
    queryKey: queryKeys.plans.nextRoutine(planId).queryKey,
    enabled: !!plan,
    query: lastDoneQuery(planId),
    map: toNextRoutineId,
  });
  if (!plan || weekLoading || nextLoading) return undefined;
  const { week, done } = planWeekFrom(latest, plan.sessionsPerWeek);
  const blockWeek = blockWeekOf(week, plan);
  return { week, done, blockWeek, deload: isDeloadWeek(blockWeek, plan), nextRoutineId };
}
