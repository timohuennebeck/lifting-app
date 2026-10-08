import { getExercise } from '@/shared/data/exercises';
import type { ExerciseHistoryEntry, WorkoutExercise, WorkoutSet } from '@/shared/data/workouts';

export interface SetValues {
  kg: number | null;
  reps: number | null;
}

/** "7–9" style target label, or null without targets. */
export function targetLabel(set: WorkoutSet) {
  if (set.targetMin == null) return null;
  const max = set.targetMax ?? set.targetMin;
  return max === set.targetMin ? String(max) : `${set.targetMin}–${max}`;
}

/**
 * Prefill for a set: its own values, else the last logged weight of this
 * session / the same set last time, and last time's reps or the target middle.
 */
export function suggestSet(
  exercise: WorkoutExercise,
  index: number,
  last: ExerciseHistoryEntry | undefined,
): SetValues {
  const set = exercise.sets[index];
  if (!set) return { kg: null, reps: null };
  const previous = last?.sets[index] ?? last?.sets.at(-1);
  const logged = exercise.sets.filter((s) => s.completedAt && s.weightKg != null);
  const loggedBefore = logged.filter((s) => s.position < set.position).at(-1) ?? logged.at(-1);
  const bodyweight = getExercise(exercise.exerciseId)?.equipment === 'bodyweight';
  const target =
    set.targetMin != null
      ? Math.round((set.targetMin + (set.targetMax ?? set.targetMin)) / 2)
      : null;
  return {
    kg: set.weightKg ?? loggedBefore?.weightKg ?? previous?.weightKg ?? (bodyweight ? 0 : null),
    reps: set.reps ?? last?.sets[index]?.reps ?? target,
  };
}

/** Index of the first set that isn't logged yet, or -1. */
export const firstOpenSet = (exercise: WorkoutExercise | undefined) =>
  exercise?.sets.findIndex((s) => !s.completedAt) ?? -1;
