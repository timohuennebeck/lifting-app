import type { Measure } from '@/shared/data/exercises';
import {
  fromDisplayWeight,
  type SetValues,
  toDisplayWeight,
  type UnitSystem,
} from '@/shared/lib/format';

import type { SetField } from '../stores/workout-session-store';
import { parseInput, toInput } from '@/shared/lib/keypad';

export const valueOf = (values: SetValues, measure: Measure) =>
  measure === 'weight' ? values.weightKg : values[measure];

/** Keypad strings for set values, with weights in the user's unit. */
export const toSetInput = (values: SetValues, units: UnitSystem): Record<SetField, string> => ({
  weight: values.weightKg == null ? '' : toInput(toDisplayWeight(values.weightKg, units)),
  reps: toInput(values.reps),
  seconds: toInput(values.seconds),
});

/** What has been typed so far (weights in kg), without defaults: the rows below show it. */
export function typedValues(input: Record<SetField, string>, units: UnitSystem): SetValues {
  const weight = parseInput(input.weight);
  return {
    weightKg: weight == null ? null : fromDisplayWeight(weight, units),
    reps: parseInput(input.reps) || null,
    seconds: parseInput(input.seconds) || null,
  };
}

/**
 * Set values (weights in kg) from keypad strings for the exercise's measures, and the first
 * box still missing a value. An empty weight on a bodyweight exercise means no extra weight.
 */
export function parseSetInput(
  input: Record<SetField, string>,
  measures: Measure[],
  bodyweight: boolean,
  units: UnitSystem,
) {
  // Zero reps or seconds isn't a set.
  const count = (m: 'reps' | 'seconds') =>
    measures.includes(m) ? parseInput(input[m]) || null : null;
  const weight = parseInput(input.weight);
  const values: SetValues = {
    weightKg: !measures.includes('weight')
      ? null
      : weight != null
        ? fromDisplayWeight(weight, units)
        : bodyweight
          ? 0
          : null,
    reps: count('reps'),
    seconds: count('seconds'),
  };
  return { values, missing: measures.find((m) => valueOf(values, m) == null) };
}
