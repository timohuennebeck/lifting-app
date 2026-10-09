import { getExercise, isTimed, measuresOf } from '@/shared/data/exercises';
import type { ExerciseHistoryEntry, WorkoutExercise, WorkoutSet } from '@/shared/data/workouts';
import { formatTarget, type SetValues } from '@/shared/lib/format';

/** "7–9" or "30–45 s" target label, or null without targets. */
export function targetLabel(set: WorkoutSet, exerciseId: string) {
  if (set.targetMin == null) return null;
  return formatTarget(set.targetMin, set.targetMax ?? set.targetMin, isTimed(exerciseId));
}

/**
 * Prefill for a set: its own values, else the last logged weight of this session / the same
 * set last time, and last time's reps or seconds or the target middle. Measures the exercise
 * doesn't use stay null.
 */
export function suggestSet(
  exercise: WorkoutExercise,
  index: number,
  last: ExerciseHistoryEntry | undefined,
): SetValues {
  const set = exercise.sets[index];
  const measures = measuresOf(exercise.exerciseId);
  if (!set) return { weightKg: null, reps: null, seconds: null };
  const previous = last?.sets[index] ?? last?.sets.at(-1);
  const logged = exercise.sets.filter((s) => s.completedAt && s.weightKg != null);
  const loggedBefore = logged.filter((s) => s.position < set.position).at(-1) ?? logged.at(-1);
  const bodyweight = getExercise(exercise.exerciseId)?.equipment === 'bodyweight';
  const target =
    set.targetMin != null
      ? Math.round((set.targetMin + (set.targetMax ?? set.targetMin)) / 2)
      : null;
  return {
    weightKg: measures.includes('weight')
      ? (set.weightKg ?? loggedBefore?.weightKg ?? previous?.weightKg ?? (bodyweight ? 0 : null))
      : null,
    reps: measures.includes('reps') ? (set.reps ?? last?.sets[index]?.reps ?? target) : null,
    seconds: measures.includes('seconds')
      ? (set.seconds ?? last?.sets[index]?.seconds ?? target)
      : null,
  };
}

/** Index of the first set that isn't logged yet, or -1. */
export const firstOpenSet = (exercise: WorkoutExercise | undefined) =>
  exercise?.sets.findIndex((s) => !s.completedAt) ?? -1;
