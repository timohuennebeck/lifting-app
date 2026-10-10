import { isTimed } from '@/shared/data/exercises';
import type { WorkoutExercise, WorkoutSet } from '@/shared/data/workouts';
import { formatTargetLabel, type SetValues } from '@/shared/lib/format';

/** "7–9 Wdh.", "8+ Wdh." or "30–45 s" target label, or null without targets. */
export const targetLabel = (set: WorkoutSet, exerciseId: string) =>
  formatTargetLabel(set.targetMin, set.targetMax, isTimed(exerciseId));

/** The row being typed in, with what has been typed so far. */
export interface TypedRow {
  index: number;
  values: SetValues;
}

const NONE: SetValues = { weightKg: null, reps: null, seconds: null };

/**
 * What row `index` holds. A logged row: its logged values. An open row: its own values (kept
 * after the check was undone), and in boxes without one those of the nearest row above that is
 * logged or being typed in, so the rows below follow as it is typed. Nothing comes from the
 * targets or from last time: a box stays empty until something is entered.
 */
export function rowValues(
  exercise: WorkoutExercise,
  index: number,
  logged: Record<string, SetValues>,
  typed?: TypedRow | null,
): SetValues {
  const valuesAt = (i: number): SetValues => logged[exercise.sets[i].id] ?? exercise.sets[i];
  const isLogged = (i: number) => !!exercise.sets[i].completedAt || !!logged[exercise.sets[i].id];
  const own = valuesAt(index);
  if (isLogged(index)) return own;
  let source = NONE;
  for (let i = index - 1; i >= 0; i--) {
    if (i === typed?.index) {
      source = typed.values;
      break;
    }
    if (isLogged(i)) {
      source = valuesAt(i);
      break;
    }
  }
  return {
    weightKg: own.weightKg ?? source.weightKg,
    reps: own.reps ?? source.reps,
    seconds: own.seconds ?? source.seconds,
  };
}

/** Index of the first set that isn't logged yet, or -1. */
export const firstOpenSet = (exercise: WorkoutExercise | undefined) =>
  exercise?.sets.findIndex((s) => !s.completedAt) ?? -1;
