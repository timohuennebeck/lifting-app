import { useStatus } from '@powersync/react-native';
import { and, count, desc, eq, isNotNull, max } from 'drizzle-orm';

import { insertCustomExercises } from './custom-exercises';
import type { CustomExercise } from './exercises';
import { newId, nowIso } from './json';
import { nextPosition } from './positions';
import { drizzle, type Executor, type Tx } from './powersync/database';
import { plans, workoutEntries } from './powersync/schema';
import { useProfile } from './profile';
import { queryKeys } from './query-keys';
import {
  insertRoutine,
  insertRoutineExercise,
  type ExerciseDraft,
  type SetTarget,
} from './routines';
import { type RowOf, useDrizzleQuery } from './use-drizzle-query';

/** A plan's weekly goal when nothing says otherwise. */
export const DEFAULT_SESSIONS_PER_WEEK = 3;
export const MAX_SESSIONS_PER_WEEK = 7;
/** A plan the AI makes: 4 weeks building up, then a deload. */
export const AI_BLOCK_WEEKS = 5;
/** Reps in reserve of every set in a deload week. */
const DELOAD_RIR = 4;

export interface RoutineDraft {
  name: string;
  exercises: ExerciseDraft[];
}

export interface PlanDraft {
  name: string;
  /** In the order they are trained. */
  routines: RoutineDraft[];
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
  const planId = newId();
  // After the user's last plan.
  await tx.insert(plans).values({
    id: planId,
    user_id: userId,
    name: plan.name,
    position: nextPosition(plans.position, eq(plans.user_id, userId)),
    sessions_per_week: clampSessions(plan.sessionsPerWeek),
    block_weeks: plan.blockWeeks,
    block_start_week: 1,
    created_at: nowIso(),
  });
  for (const [index, routine] of plan.routines.entries()) {
    const routineId = await insertRoutine(tx, userId, planId, routine.name, index);
    for (const [position, exercise] of routine.exercises.entries()) {
      await insertRoutineExercise(tx, userId, routineId, position, exercise);
    }
  }
  return planId;
}

export interface PlanSummary {
  id: string;
  name: string;
  sessionsPerWeek: number;
  blockWeeks: number | null;
  blockStartWeek: number;
}

const planListQuery = () =>
  drizzle
    .select({
      id: plans.id,
      name: plans.name,
      sessions_per_week: plans.sessions_per_week,
      block_weeks: plans.block_weeks,
      block_start_week: plans.block_start_week,
    })
    .from(plans)
    .orderBy(plans.position);

const toPlans = (rows: RowOf<typeof planListQuery>[]) =>
  rows.map((r): PlanSummary => ({
    id: r.id,
    name: r.name,
    sessionsPerWeek: r.sessions_per_week,
    blockWeeks: r.block_weeks,
    blockStartWeek: r.block_start_week,
  }));

/** All of the user's plans, in their order. */
export function usePlans() {
  return useDrizzleQuery({
    queryKey: queryKeys.plans.list.queryKey,
    query: planListQuery(),
    map: toPlans,
  });
}

/**
 * The plan Training follows and shows first (the one marked active, else the first; undefined
 * without plans) and the profile. Loading until those are known, the first sync included: before
 * it, a returning user's plans aren't on the phone yet.
 */
export function useCurrentPlan() {
  const { hasSynced } = useStatus();
  const { profile, isLoading: profileLoading } = useProfile();
  const { data: plans = [], isLoading: plansLoading } = usePlans();
  const plan = plans.find((p) => p.id === profile?.activePlanId) ?? plans.at(0);
  return { plan, profile, isLoading: !hasSynced || profileLoading || plansLoading };
}

interface PlanWeek {
  /** Plan week now: 1 at the start, one more each time a week's workouts are done. */
  week: number;
  /** Workouts of it done. */
  done: number;
}

/** A plan's latest plan week with how many workouts it has. */
interface LatestWeek {
  week: number;
  count: number;
}

/**
 * The plan week a plan is in, from its latest week and how many workouts that week has: it is
 * over once it has the weekly goal, however long that took.
 */
function planWeekFrom(latest: LatestWeek | undefined, sessionsPerWeek: number): PlanWeek {
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

const isDeloadWeek = (blockWeek: number | null, plan: Pick<PlanSummary, 'blockWeeks'>) =>
  blockWeek !== null && blockWeek === plan.blockWeeks;

/** How many of an exercise's sets a deload week keeps: the first half, rounded up. */
const deloadSetCount = (sets: number) => Math.ceil(sets / 2);

/**
 * A routine's sets for a block week: one rep less in reserve each week after the first (never
 * below 0), and in the deload only the first half of the sets, with DELOAD_RIR in reserve.
 * Sets without reps in reserve (e.g. timed holds) keep none.
 */
export function setsForWeek<TSet extends Pick<SetTarget, 'rir'>>(
  sets: TSet[],
  blockWeek: number | null,
  plan: Pick<PlanSummary, 'blockWeeks'>,
): TSet[] {
  if (blockWeek === null) return sets;
  if (isDeloadWeek(blockWeek, plan)) {
    return sets
      .slice(0, deloadSetCount(sets.length))
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

const toLatest = (rows: RowOf<typeof latestWeekQuery>[]): LatestWeek | undefined => {
  const row = rows[0];
  return row?.week ? { week: row.week, count: row.count } : undefined;
};

/** The plan week a workout started now counts for (inside `tx`, so two can't take one place). */
export async function currentPlanWeek(tx: Tx, planId: string, sessionsPerWeek: number) {
  return planWeekFrom(toLatest(await latestWeekQuery(tx, planId, false)), sessionsPerWeek).week;
}

export interface PlanStatus extends PlanWeek {
  /** Week of the block (1 to `blockWeeks`), or null without blocks. */
  blockWeek: number | null;
  deload: boolean;
}

const weekDoneQuery = (planId: string, week: number) =>
  drizzle
    .select({ routineId: workoutEntries.routine_id, finishedAt: max(workoutEntries.finished_at) })
    .from(workoutEntries)
    .where(
      and(
        eq(workoutEntries.plan_id, planId),
        eq(workoutEntries.plan_week, week),
        isNotNull(workoutEntries.finished_at),
      ),
    )
    .groupBy(workoutEntries.routine_id);

const toFinishedAt = (rows: RowOf<typeof weekDoneQuery>[]) =>
  new Map(
    rows.flatMap((r) =>
      r.routineId && r.finishedAt ? [[r.routineId, r.finishedAt] as const] : [],
    ),
  );

/**
 * The plan's routines with a finished workout in plan week `week` (done for that week), each with
 * when it was finished (the last time, if twice).
 */
export function usePlanWeekDone(planId: string | undefined, week: number | undefined) {
  return useDrizzleQuery({
    queryKey: queryKeys.plans.weekDone(planId ?? '', week ?? 0).queryKey,
    enabled: !!planId && !!week,
    query: weekDoneQuery(planId ?? '', week ?? 0),
    map: toFinishedAt,
  });
}

/** Where a plan stands: its week and the block week. Undefined while loading. */
export function usePlanStatus(plan: PlanSummary | undefined): PlanStatus | undefined {
  const planId = plan?.id ?? '';
  const { data: latest, isLoading } = useDrizzleQuery({
    queryKey: queryKeys.plans.latestWeek(planId).queryKey,
    enabled: !!plan,
    query: latestWeekQuery(drizzle, planId, true),
    map: toLatest,
  });
  if (!plan || isLoading) return undefined;
  const { week, done } = planWeekFrom(latest, plan.sessionsPerWeek);
  const blockWeek = blockWeekOf(week, plan);
  return { week, done, blockWeek, deload: isDeloadWeek(blockWeek, plan) };
}
