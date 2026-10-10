import { createQueryKeys } from '@lukemorales/query-key-factory';
import { and, eq, isNotNull } from 'drizzle-orm';

import { drizzle } from '@/shared/data/powersync/database';
import { workoutExercises, workouts, workoutSets } from '@/shared/data/powersync/schema';
import { type RowOf, useDrizzleQuery } from '@/shared/data/use-drizzle-query';
import type { SetValues } from '@/shared/lib/format';

const searchKeys = createQueryKeys('search', { records: null });

export interface ExerciseRecord {
  /** The heaviest set: most weight, then most reps, then most seconds. */
  best: SetValues;
  /** Start of the last finished workout with this exercise. */
  lastAt: string;
}

const recordsQuery = () =>
  drizzle
    .select({
      exercise_id: workoutExercises.exercise_id,
      weight_kg: workoutSets.weight_kg,
      reps: workoutSets.reps,
      seconds: workoutSets.seconds,
      started_at: workouts.started_at,
    })
    .from(workoutSets)
    .innerJoin(workoutExercises, eq(workoutExercises.id, workoutSets.workout_exercise_id))
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workout_id))
    .where(and(isNotNull(workoutSets.completed_at), isNotNull(workouts.finished_at)));

/** Weight decides, then reps, then seconds; exercises without weight start at reps. */
const heavier = (a: SetValues, b: SetValues) => {
  for (const key of ['weightKg', 'reps', 'seconds'] as const) {
    const diff = (a[key] ?? -1) - (b[key] ?? -1);
    if (diff) return diff > 0;
  }
  return false;
};

function toRecords(rows: RowOf<typeof recordsQuery>[]) {
  const records = new Map<string, ExerciseRecord>();
  for (const r of rows) {
    const set = { weightKg: r.weight_kg, reps: r.reps, seconds: r.seconds };
    const record = records.get(r.exercise_id);
    if (!record) {
      records.set(r.exercise_id, { best: set, lastAt: r.started_at });
      continue;
    }
    if (heavier(set, record.best)) record.best = set;
    if (r.started_at > record.lastAt) record.lastAt = r.started_at;
  }
  return records;
}

/** Each trained exercise's heaviest set and when it was last done, from finished workouts. */
export function useExerciseRecords() {
  return useDrizzleQuery({
    queryKey: searchKeys.records.queryKey,
    query: recordsQuery(),
    map: toRecords,
  });
}
