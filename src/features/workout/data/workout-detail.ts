import { asc, eq } from 'drizzle-orm';

import { drizzle } from '@/shared/data/powersync/database';
import {
  workoutEntries,
  workoutEntriesExercises,
  workoutEntriesSets,
} from '@/shared/data/powersync/schema';
import { queryKeys } from '@/shared/data/query-keys';
import { type RowOf, useDrizzleQuery } from '@/shared/data/use-drizzle-query';
import type { SetValues } from '@/shared/lib/format';

export interface WorkoutSet extends SetValues {
  id: string;
  /** Reps, or seconds for timed exercises. */
  targetMin: number | null;
  targetMax: number | null;
  targetRir: number | null;
  /** Reps in reserve as entered in the number pad. */
  rir: number | null;
  completedAt: string | null;
  isPr: boolean;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  restSeconds: number | null;
  sets: WorkoutSet[];
}

export interface WorkoutDetail {
  id: string;
  name: string;
  startedAt: string;
  finishedAt: string | null;
  exercises: WorkoutExercise[];
}

/** One workout with its exercises and their sets, each ordered by position. */
const workoutDetailQuery = (workoutId: string) =>
  drizzle.query.workoutEntries.findMany({
    columns: { id: true, name: true, started_at: true, finished_at: true },
    where: eq(workoutEntries.id, workoutId),
    with: {
      exercises: {
        columns: { id: true, exercise_id: true, rest_seconds: true },
        orderBy: asc(workoutEntriesExercises.position),
        with: {
          sets: {
            columns: { user_id: false, workout_entries_exercise_id: false },
            orderBy: asc(workoutEntriesSets.position),
          },
        },
      },
    },
  });

type WorkoutDetailRow = RowOf<typeof workoutDetailQuery>;

const toWorkoutSet = (s: WorkoutDetailRow['exercises'][number]['sets'][number]): WorkoutSet => ({
  id: s.id,
  targetMin: s.target_min,
  targetMax: s.target_max,
  targetRir: s.target_rir,
  rir: s.rir,
  weightKg: s.weight_kg,
  reps: s.reps,
  seconds: s.seconds,
  completedAt: s.completed_at,
  isPr: s.is_pr,
});

function toDetail([w]: WorkoutDetailRow[]): WorkoutDetail | null {
  if (!w) return null;
  return {
    id: w.id,
    name: w.name,
    startedAt: w.started_at,
    finishedAt: w.finished_at,
    exercises: w.exercises.map((e) => ({
      id: e.id,
      exerciseId: e.exercise_id,
      restSeconds: e.rest_seconds,
      sets: e.sets.map(toWorkoutSet),
    })),
  };
}

export function useWorkout(workoutId: string | undefined) {
  return useDrizzleQuery({
    queryKey: queryKeys.workouts.detail(workoutId ?? '').queryKey,
    enabled: !!workoutId,
    query: workoutDetailQuery(workoutId ?? ''),
    map: toDetail,
  });
}
