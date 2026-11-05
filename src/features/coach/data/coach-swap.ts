import { and, asc, eq, inArray } from 'drizzle-orm';

import { nowIso } from '@/shared/data/json';
import { drizzle } from '@/shared/data/powersync/database';
import { routineExercises, routines } from '@/shared/data/powersync/schema';
import { swapInRoutines } from '@/shared/data/routines';
import { type RowOf, useDrizzleQuery } from '@/shared/data/use-drizzle-query';

import type { SwapRoutine } from '../lib/swap';
import { coachKeys } from './coach-keys';

/** The workouts of a plan change with their exercises and sets, in plan order. */
const swapRoutinesQuery = (routineIds: string[]) =>
  drizzle.query.routines.findMany({
    columns: { id: true, name: true },
    where: inArray(routines.id, routineIds),
    orderBy: asc(routines.position),
    with: {
      exercises: {
        columns: { exercise_id: true },
        orderBy: asc(routineExercises.position),
        with: { sets: { columns: { target_min: true, target_max: true } } },
      },
    },
  });

/** Each exercise with its sets as one line: the lowest target to the highest. */
const toSwapRoutines = (rows: RowOf<typeof swapRoutinesQuery>[]): SwapRoutine[] =>
  rows.map((r) => ({
    id: r.id,
    name: r.name,
    exercises: r.exercises.map((e) => {
      const lows = e.sets.flatMap((s) => s.target_min ?? s.target_max ?? []);
      const highs = e.sets.flatMap((s) => s.target_max ?? s.target_min ?? []);
      return {
        exerciseId: e.exercise_id,
        sets: e.sets.length,
        targetMin: lows.length ? Math.min(...lows) : null,
        targetMax: highs.length ? Math.max(...highs) : null,
      };
    }),
  }));

/** The workouts a plan change touches, as they are now; gone ones are left out. */
export function useSwapRoutines(routineIds: string[]) {
  return useDrizzleQuery({
    queryKey: coachKeys.swapRoutines(routineIds.join(',')).queryKey,
    query: swapRoutinesQuery(routineIds),
    map: toSwapRoutines,
  });
}

export interface PlanSwap {
  from: string;
  to: string;
  routineIds: string[];
}

/**
 * Puts each `to` in place of its `from` in those workouts, in one go. Sets and rest stay; their
 * targets reset only between reps and seconds (`swapTargets`), which the coach's options avoid.
 * A workout running now is a copy and keeps its exercises.
 */
export async function swapInPlan(swaps: PlanSwap[]) {
  await drizzle.transaction(async (tx) => {
    const touched = new Set<string>();
    for (const { from, to, routineIds } of swaps) {
      const rows = await tx
        .select({ id: routineExercises.id, routineId: routineExercises.routine_id })
        .from(routineExercises)
        .where(
          and(
            inArray(routineExercises.routine_id, routineIds),
            eq(routineExercises.exercise_id, from),
          ),
        );
      if (!rows.length) continue;
      const ids = rows.map((r) => r.id);
      await swapInRoutines(tx, ids, from, to);
      for (const row of rows) touched.add(row.routineId);
    }
    for (const id of touched) {
      await tx.update(routines).set({ updated_at: nowIso() }).where(eq(routines.id, id));
    }
  });
}
