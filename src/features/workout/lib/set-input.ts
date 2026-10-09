import type { Measure } from '@/shared/data/exercises';
import type { SetValues, UnitSystem } from '@/shared/lib/format';

import type { SetField } from '../stores/workout-session-store';
import { parseInput, toInput } from './keypad';
import { fromDisplayWeight, toDisplayWeight } from './weight';

export const valueOf = (values: SetValues, measure: Measure) =>
  measure === 'weight' ? values.weightKg : values[measure];

/** Keypad strings for set values, with weights in the user's unit. */
export const toSetInput = (values: SetValues, units: UnitSystem): Record<SetField, string> => ({
  weight: values.weightKg == null ? '' : toInput(toDisplayWeight(values.weightKg, units)),
  reps: toInput(values.reps),
  seconds: toInput(values.seconds),
});

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
