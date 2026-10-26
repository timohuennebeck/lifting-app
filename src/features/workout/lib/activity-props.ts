import type { Measure } from '@/shared/data/exercises';
import {
  formatNumber,
  formatWeightValue,
  type SetValues,
  type UnitSystem,
  weightUnit,
} from '@/shared/lib/format';

import type { WorkoutExercise } from '../data/workout-detail';
import { valueOf } from './set-input';

/** A number with its unit, e.g. "80" "kg"; the unit is empty for reps after a weight. */
export interface ActivityValue {
  value: string;
  unit: string;
}

/** The set the Live Activity offers to log. */
export interface ActivitySet {
  exerciseIndex: number;
  setIndex: number;
  exercise: string;
  /** Whether each set of the exercise is logged, for the segments under the values. */
  done: boolean[];
  values: ActivityValue[];
  /** False while a box is still empty: the button is hidden then. */
  loggable: boolean;
}

/** Texts in the app language: the widget runtime has no i18n. */
export interface ActivityTexts {
  rest: string;
  /** Read out for the ±10 s buttons, which show icons. */
  minus: string;
  plus: string;
  skipRest: string;
  logSet: string;
  /** "Set" and "of 4" around the set number's badge. */
  setBefore: string;
  setAfter: string;
  /** Instead of a set when every set is logged; empty for a workout without sets. */
  allDone: string;
}

/** Everything the Live Activity shows; sent as JSON on each change. */
export interface WorkoutActivityProps {
  workoutId: string;
  workoutName: string;
  /** Epoch ms; the clock counts up from it. */
  startedAt: number;
  /** The running rest in epoch ms, or null. */
  rest: { from: number; to: number } | null;
  next: ActivitySet | null;
  texts: ActivityTexts;
}

/**
 * Targets of the Live Activity's buttons, handled in the app (`useWorkoutActivity`). The layout
 * keeps its own copy: it can't read anything declared outside it.
 */
export const ACTIVITY_TARGETS = {
  minus: 'workout-rest-minus',
  plus: 'workout-rest-plus',
  skipRest: 'workout-rest-skip',
  logSet: 'workout-log-set',
} as const;

/**
 * The first set not logged yet, from exercise `from` on and then from the top. Sets just logged
 * (`logged`, not in the database yet) count as logged.
 */
export function nextOpenSet(
  exercises: WorkoutExercise[],
  from: number,
  logged: Record<string, SetValues>,
) {
  for (let step = 0; step < exercises.length; step++) {
    const exerciseIndex = (from + step) % exercises.length;
    const setIndex = exercises[exerciseIndex].sets.findIndex(
      (s) => !s.completedAt && !(s.id in logged),
    );
    if (setIndex >= 0) return { exerciseIndex, setIndex };
  }
  return null;
}

interface ValueUnits {
  units: UnitSystem;
  /** Unit of a reps count shown on its own ("reps"), and of seconds ("s"). */
  reps: string;
  seconds: string;
}

/**
 * A set's values as the Live Activity's big line: "80 kg × 8", "8 reps", "45 s". A bodyweight
 * exercise without extra weight leaves the weight out; an empty box shows "–".
 */
export function activityValues(
  values: SetValues,
  measures: Measure[],
  bodyweight: boolean,
  units: ValueUnits,
) {
  const parts: ActivityValue[] = [];
  for (const measure of measures) {
    const value = valueOf(values, measure);
    if (measure === 'weight') {
      if (bodyweight && !value) continue;
      parts.push({
        value: value == null ? '–' : formatWeightValue(value, units.units),
        unit: weightUnit(units.units),
      });
    } else if (measure === 'reps') {
      parts.push({ value: value == null ? '–' : `${value}`, unit: parts.length ? '' : units.reps });
    } else {
      parts.push({ value: value == null ? '–' : formatNumber(value, 0), unit: units.seconds });
    }
  }
  return parts;
}
