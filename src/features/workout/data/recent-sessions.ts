import { and, desc, eq, inArray, isNotNull } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';

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

export interface RecentSet extends SetValues {
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

const otherExercises = alias(workoutEntriesExercises, 'other_exercises');
const otherWorkouts = alias(workoutEntries, 'other_workouts');

/** The newest finished workouts with the outer row's exercise (a correlated subquery). */
const recentWorkoutsOfExercise = drizzle
  .select({ id: otherWorkouts.id })
  .from(otherExercises)
  .innerJoin(otherWorkouts, eq(otherWorkouts.id, otherExercises.workout_entries_id))
  .where(
    and(
      eq(otherExercises.exercise_id, workoutEntriesExercises.exercise_id),
      isNotNull(otherWorkouts.finished_at),
    ),
  )
  .orderBy(desc(otherWorkouts.started_at))
  .limit(RECENT_WORKOUTS);

const recentSessionsQuery = (exerciseIds: string[]) =>
  drizzle
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
    .from(workoutEntriesSets)
    .innerJoin(
      workoutEntriesExercises,
      eq(workoutEntriesExercises.id, workoutEntriesSets.workout_entries_exercise_id),
    )
    .innerJoin(workoutEntries, eq(workoutEntries.id, workoutEntriesExercises.workout_entries_id))
    .where(
      and(
        inArray(workoutEntriesExercises.exercise_id, exerciseIds),
        isNotNull(workoutEntriesSets.completed_at),
        hasKnownWeight(workoutEntriesSets, workoutEntriesExercises),
        inArray(workoutEntries.id, recentWorkoutsOfExercise),
      ),
    )
    .orderBy(
      desc(workoutEntries.started_at),
      workoutEntriesExercises.position,
      workoutEntriesSets.position,
    );

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
