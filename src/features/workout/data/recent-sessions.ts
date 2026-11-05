import { and, desc, eq, inArray, isNotNull, lte, sql } from 'drizzle-orm';

import { drizzle } from '@/shared/data/powersync/database';
import {
  workoutEntries,
  workoutEntriesExercises,
  workoutEntriesSets,
} from '@/shared/data/powersync/schema';
import { queryKeys } from '@/shared/data/query-keys';
import { type RowOf, useDrizzleQuery } from '@/shared/data/use-drizzle-query';
import { hasKnownWeight } from '@/shared/data/workouts';
import type { SetValues } from '@/shared/lib/format';
import { getOrInsert } from '@/shared/lib/map';

/** Workouts per exercise the suggestions look back on. */
const RECENT_WORKOUTS = 3;

interface RecentSet extends SetValues {
  targetMin: number | null;
  targetMax: number | null;
  targetRir: number | null;
  /** Reps in reserve as entered. */
  rir: number | null;
}

export interface RecentSession {
  startedAt: string;
  sets: RecentSet[];
}

/**
 * The sets of each exercise in its last three finished workouts. Each exercise's workouts are
 * ranked once (a window function): a correlated "last three" subquery ran again for every set.
 */
function recentSessionsQuery(exerciseIds: string[]) {
  // An exercise twice in one workout counts that workout once.
  const pairs = drizzle.$with('pairs').as(
    drizzle
      .selectDistinct({
        exercise_id: workoutEntriesExercises.exercise_id,
        workout_id: sql<string>`${workoutEntries.id}`.as('workout_id'),
        started_at: workoutEntries.started_at,
      })
      .from(workoutEntriesExercises)
      .innerJoin(workoutEntries, eq(workoutEntries.id, workoutEntriesExercises.workout_entries_id))
      .where(
        and(
          inArray(workoutEntriesExercises.exercise_id, exerciseIds),
          isNotNull(workoutEntries.finished_at),
        ),
      ),
  );
  const ranked = drizzle.$with('ranked').as(
    drizzle
      .select({
        exercise_id: pairs.exercise_id,
        workout_id: pairs.workout_id,
        recency:
          sql<number>`row_number() over (partition by ${pairs.exercise_id} order by ${pairs.started_at} desc)`.as(
            'recency',
          ),
      })
      .from(pairs),
  );
  return drizzle
    .with(pairs, ranked)
    .select({
      workout_entries_id: workoutEntries.id,
      started_at: workoutEntries.started_at,
      exercise_id: workoutEntriesExercises.exercise_id,
      weight_kg: workoutEntriesSets.weight_kg,
      reps: workoutEntriesSets.reps,
      seconds: workoutEntriesSets.seconds,
      rir: workoutEntriesSets.rir,
      target_min: workoutEntriesSets.target_min,
      target_max: workoutEntriesSets.target_max,
      target_rir: workoutEntriesSets.target_rir,
    })
    .from(ranked)
    .innerJoin(workoutEntries, eq(workoutEntries.id, ranked.workout_id))
    .innerJoin(
      workoutEntriesExercises,
      and(
        eq(workoutEntriesExercises.workout_entries_id, ranked.workout_id),
        eq(workoutEntriesExercises.exercise_id, ranked.exercise_id),
      ),
    )
    .innerJoin(
      workoutEntriesSets,
      eq(workoutEntriesSets.workout_entries_exercise_id, workoutEntriesExercises.id),
    )
    .where(
      and(
        lte(ranked.recency, RECENT_WORKOUTS),
        isNotNull(workoutEntriesSets.completed_at),
        hasKnownWeight(workoutEntriesSets, workoutEntriesExercises),
      ),
    )
    .orderBy(
      desc(workoutEntries.started_at),
      workoutEntriesExercises.position,
      workoutEntriesSets.position,
    );
}

/** Per exercise its sessions, newest first. */
function toRecentSessions(rows: RowOf<typeof recentSessionsQuery>[]) {
  const byExercise = new Map<string, Map<string, RecentSession>>();
  for (const r of rows) {
    const sessions = getOrInsert(byExercise, r.exercise_id, () => new Map());
    const session = getOrInsert(sessions, r.workout_entries_id, () => ({
      startedAt: r.started_at,
      sets: [],
    }));
    session.sets.push({
      weightKg: r.weight_kg,
      reps: r.reps,
      seconds: r.seconds,
      rir: r.rir,
      targetMin: r.target_min,
      targetMax: r.target_max,
      targetRir: r.target_rir,
    });
  }
  const out: Record<string, RecentSession[]> = {};
  for (const [exerciseId, sessions] of byExercise) out[exerciseId] = [...sessions.values()];
  return out;
}

/** The last finished workouts (up to three) of each exercise, for the suggestions. */
export function useRecentSessions(exerciseIds: string[]) {
  const ids = [...new Set(exerciseIds)].sort();
  return useDrizzleQuery({
    queryKey: queryKeys.workouts.recentSessions(ids.join()).queryKey,
    enabled: ids.length > 0,
    query: recentSessionsQuery(ids),
    map: toRecentSessions,
  });
}
