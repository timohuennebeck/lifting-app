import { useMemo } from 'react';

import {
  type ExerciseHistoryEntry,
  type ExerciseHistorySet,
  useExerciseHistory,
} from '@/shared/data/workouts';

export interface ExerciseSession extends ExerciseHistoryEntry {
  /** Heaviest set (most reps on ties). */
  topSet: ExerciseHistorySet;
  volumeKg: number;
  hasPr: boolean;
}

function toSession(entry: ExerciseHistoryEntry): ExerciseSession {
  const topSet = entry.sets.reduce((top, set) =>
    set.weightKg > top.weightKg || (set.weightKg === top.weightKg && set.reps > top.reps)
      ? set
      : top,
  );
  return {
    ...entry,
    topSet,
    volumeKg: entry.sets.reduce((sum, s) => sum + s.weightKg * s.reps, 0),
    hasPr: entry.sets.some((s) => s.isPr),
  };
}

/** Finished sessions of one exercise with top set, volume and PR flag, newest first. */
export function useExerciseSessions(exerciseId: string | undefined) {
  const query = useExerciseHistory(exerciseId);
  const data = useMemo(() => query.data?.map(toSession), [query.data]);
  return { ...query, data };
}
