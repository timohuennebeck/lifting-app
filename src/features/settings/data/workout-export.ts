import { createQueryKeys } from '@lukemorales/query-key-factory';
import { and, asc, count, countDistinct, eq, isNotNull, min } from 'drizzle-orm';

import { drizzle } from '@/shared/data/powersync/database';
import {
  plans,
  workoutEntries,
  workoutEntriesExercises,
  workoutEntriesSets,
} from '@/shared/data/powersync/schema';
import { type RowOf, useDrizzleQuery } from '@/shared/data/use-drizzle-query';

import type { ExportSet } from '../lib/workouts-csv';

const exportKeys = createQueryKeys('workoutExport', {
  summary: null,
});

/** What the export holds: completed sets of finished workouts, as in the history. */
const exported = and(
  isNotNull(workoutEntries.finished_at),
  isNotNull(workoutEntriesSets.completed_at),
);

const summaryQuery = () =>
  drizzle
    .select({
      count: countDistinct(workoutEntries.id),
      first: min(workoutEntries.started_at),
    })
    .from(workoutEntriesSets)
    .innerJoin(
      workoutEntriesExercises,
      eq(workoutEntriesExercises.id, workoutEntriesSets.workout_entries_exercise_id),
    )
    .innerJoin(workoutEntries, eq(workoutEntries.id, workoutEntriesExercises.workout_entries_id))
    .where(exported);

const toSummary = (rows: RowOf<typeof summaryQuery>[]) => ({
  count: rows[0]?.count ?? 0,
  first: rows[0]?.first ?? null,
});

/** How many workouts the file would hold and when the first of them started. */
export function useExportSummary(enabled: boolean) {
  return useDrizzleQuery({
    queryKey: exportKeys.summary.queryKey,
    query: summaryQuery(),
    enabled,
    map: toSummary,
  });
}

export async function countExportSets() {
  const row = await drizzle
    .select({ count: count() })
    .from(workoutEntriesSets)
    .innerJoin(
      workoutEntriesExercises,
      eq(workoutEntriesExercises.id, workoutEntriesSets.workout_entries_exercise_id),
    )
    .innerJoin(workoutEntries, eq(workoutEntries.id, workoutEntriesExercises.workout_entries_id))
    .where(exported)
    .get();
  return row?.count ?? 0;
}

/** One page of the export's sets, oldest workout first, in the order they were done. */
export async function readExportSets(limit: number, offset: number): Promise<ExportSet[]> {
  const rows = await drizzle
    .select({
      workoutId: workoutEntries.id,
      workoutExerciseId: workoutEntriesExercises.id,
      startedAt: workoutEntries.started_at,
      finishedAt: workoutEntries.finished_at,
      workout: workoutEntries.name,
      plan: plans.name,
      planWeek: workoutEntries.plan_week,
      exerciseId: workoutEntriesExercises.exercise_id,
      weightKg: workoutEntriesSets.weight_kg,
      reps: workoutEntriesSets.reps,
      seconds: workoutEntriesSets.seconds,
      rir: workoutEntriesSets.rir,
      isPr: workoutEntriesSets.is_pr,
      targetMin: workoutEntriesSets.target_min,
      targetMax: workoutEntriesSets.target_max,
      targetRir: workoutEntriesSets.target_rir,
      restSeconds: workoutEntriesExercises.rest_seconds,
    })
    .from(workoutEntriesSets)
    .innerJoin(
      workoutEntriesExercises,
      eq(workoutEntriesExercises.id, workoutEntriesSets.workout_entries_exercise_id),
    )
    .innerJoin(workoutEntries, eq(workoutEntries.id, workoutEntriesExercises.workout_entries_id))
    .leftJoin(plans, eq(plans.id, workoutEntries.plan_id))
    .where(exported)
    .orderBy(
      asc(workoutEntries.started_at),
      asc(workoutEntries.id),
      asc(workoutEntriesExercises.position),
      asc(workoutEntriesExercises.id),
      asc(workoutEntriesSets.position),
      asc(workoutEntriesSets.id),
    )
    .limit(limit)
    .offset(offset);
  // The query only returns finished workouts.
  return rows.map((row) => ({ ...row, finishedAt: row.finishedAt! }));
}
