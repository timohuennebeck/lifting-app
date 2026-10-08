import { createQueryKeys } from '@lukemorales/query-key-factory';

import { parseJson } from '@/shared/data/json';
import { useSqlQuery } from '@/shared/data/use-sql-query';
import { estimateOneRepMax } from '@/shared/data/workouts';

const recordKeys = createQueryKeys('workoutRecords', {
  detail: (workoutId: string) => [workoutId],
});

export interface WorkoutRecord {
  exerciseId: string;
  weightKg: number;
  reps: number;
  previous: { weightKg: number; reps: number };
}

interface RecordRow {
  exercise_id: string;
  weight_kg: number;
  reps: number;
  previous: string | null;
}

/** Best PR set per exercise; only exercises with an earlier best are kept. */
function toRecords(rows: RecordRow[]): WorkoutRecord[] {
  const best = new Map<string, WorkoutRecord>();
  for (const r of rows) {
    const previous = parseJson<WorkoutRecord['previous'] | null>(r.previous, null);
    if (!previous) continue;
    const current = best.get(r.exercise_id);
    if (
      current &&
      estimateOneRepMax(current.weightKg, current.reps) >= estimateOneRepMax(r.weight_kg, r.reps)
    ) {
      continue;
    }
    best.set(r.exercise_id, {
      exerciseId: r.exercise_id,
      weightKg: r.weight_kg,
      reps: r.reps,
      previous,
    });
  }
  return [...best.values()];
}

/** New personal records of a workout with the best set from before it. */
export function useWorkoutRecords(workoutId: string | undefined) {
  return useSqlQuery({
    queryKey: recordKeys.detail(workoutId ?? '').queryKey,
    enabled: !!workoutId,
    sql: `SELECT we.exercise_id, s.weight_kg, s.reps,
            (SELECT json_object('weightKg', p.weight_kg, 'reps', p.reps)
               FROM workout_sets p
               JOIN workout_exercises pe ON pe.id = p.workout_exercise_id
               JOIN workouts pw ON pw.id = pe.workout_id
              WHERE pe.exercise_id = we.exercise_id AND p.completed_at IS NOT NULL
                AND pw.id != w.id AND pw.started_at < w.started_at
              ORDER BY p.weight_kg * (1 + p.reps / 30.0) DESC LIMIT 1) AS previous
          FROM workout_sets s
          JOIN workout_exercises we ON we.id = s.workout_exercise_id
          JOIN workouts w ON w.id = we.workout_id
          WHERE w.id = ? AND s.is_pr = 1 AND s.completed_at IS NOT NULL
          ORDER BY we.position, s.position`,
    parameters: [workoutId],
    map: toRecords,
  });
}
