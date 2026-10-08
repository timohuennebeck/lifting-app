import { useSqlQuery } from '@/shared/data/use-sql-query';

import { workoutFeatureKeys } from './workout-keys';

export interface SessionSet {
  weightKg: number;
  reps: number;
  rir: number | null;
  isPr: boolean;
}

export interface ExerciseSession {
  workoutId: string;
  name: string;
  startedAt: string;
  finishedAt: string | null;
  sets: SessionSet[];
  /** Heaviest set (most reps on ties). */
  topSet: SessionSet;
  volumeKg: number;
  hasPr: boolean;
}

interface SessionRow {
  workout_id: string;
  name: string;
  started_at: string;
  finished_at: string | null;
  weight_kg: number;
  reps: number;
  target_rir: number | null;
  is_pr: number;
}

function toSessions(rows: SessionRow[]): ExerciseSession[] {
  const map = new Map<string, ExerciseSession>();
  for (const r of rows) {
    const set = { weightKg: r.weight_kg, reps: r.reps, rir: r.target_rir, isPr: !!r.is_pr };
    const session = map.get(r.workout_id);
    if (!session) {
      map.set(r.workout_id, {
        workoutId: r.workout_id,
        name: r.name,
        startedAt: r.started_at,
        finishedAt: r.finished_at,
        sets: [set],
        topSet: set,
        volumeKg: set.weightKg * set.reps,
        hasPr: set.isPr,
      });
      continue;
    }
    session.sets.push(set);
    session.volumeKg += set.weightKg * set.reps;
    session.hasPr ||= set.isPr;
    const top = session.topSet;
    if (set.weightKg > top.weightKg || (set.weightKg === top.weightKg && set.reps > top.reps)) {
      session.topSet = set;
    }
  }
  return [...map.values()];
}

/** Finished sessions of one exercise with workout names, newest first. */
export function useExerciseSessions(exerciseId: string | undefined) {
  return useSqlQuery({
    queryKey: workoutFeatureKeys.exerciseSessions(exerciseId ?? '').queryKey,
    enabled: !!exerciseId,
    sql: `SELECT w.id AS workout_id, w.name, w.started_at, w.finished_at,
              s.weight_kg, s.reps, s.target_rir, s.is_pr
            FROM workout_sets s
            JOIN workout_exercises we ON we.id = s.workout_exercise_id
            JOIN workouts w ON w.id = we.workout_id
            WHERE we.exercise_id = ? AND s.completed_at IS NOT NULL AND w.finished_at IS NOT NULL
            ORDER BY w.started_at DESC, we.position, s.position`,
    parameters: [exerciseId],
    map: toSessions,
  });
}
