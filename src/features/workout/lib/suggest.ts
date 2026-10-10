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

const pick = ({ weightKg, reps, seconds }: SetValues): SetValues => ({ weightKg, reps, seconds });

const merge = (own: SetValues, above: SetValues): SetValues => ({
  weightKg: own.weightKg ?? above.weightKg,
  reps: own.reps ?? above.reps,
  seconds: own.seconds ?? above.seconds,
});

/**
 * What row `index` holds. A logged row: its logged values. An open row: its own values (typed
 * before the keypad closed, or kept after the check was undone), and in boxes without one what
 * the row above holds or is being typed with, so the rows below follow as it is typed. Nothing
 * comes from the targets or from last time: a box stays empty until something is entered.
 * `drafts` are own values the database doesn't have yet.
 */
export function rowValues(
  exercise: WorkoutExercise,
  index: number,
  logged: Record<string, SetValues>,
  typed?: TypedRow | null,
  drafts: Record<string, Partial<SetValues>> = {},
): SetValues {
  const loggedAt = (i: number) => {
    const set = exercise.sets[i];
    return logged[set.id] ?? (set.completedAt ? pick(set) : null);
  };
  const open = (i: number): SetValues => {
    const set = exercise.sets[i];
    return merge({ ...pick(set), ...drafts[set.id] }, passedOn(i - 1));
  };
  // What a row hands down to the one below it.
  const passedOn = (i: number): SetValues =>
    i < 0 ? NONE : i === typed?.index ? typed.values : (loggedAt(i) ?? open(i));
  return loggedAt(index) ?? open(index);
}

/** Index of the first set that isn't logged yet, or -1. */
export const firstOpenSet = (exercise: WorkoutExercise | undefined) =>
  exercise?.sets.findIndex((s) => !s.completedAt) ?? -1;
