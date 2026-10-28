import type { UnitSystem } from '@/shared/lib/format';

interface PerUnit {
  kg: number;
  lb: number;
}

/** The usual step between weights per equipment; the gym's own show in the weights logged. */
const STEPS: Record<string, PerUnit> = {
  barbell: { kg: 2.5, lb: 5 },
  dumbbell: { kg: 2, lb: 5 },
  machine: { kg: 5, lb: 10 },
  cable: { kg: 2.5, lb: 5 },
  bodyweight: { kg: 2.5, lb: 5 },
};
const OTHER: PerUnit = { kg: 2.5, lb: 5 };
/** Light dumbbells usually come in smaller steps (1 to 10 kg in steps of 1). */
const LIGHT_DUMBBELLS = { below: { kg: 10, lb: 25 }, step: { kg: 1, lb: 2.5 } };
/** Steps a gym may have, biggest first. */
const CANDIDATES = { kg: [5, 2.5, 2, 1.25, 1, 0.5], lb: [10, 5, 2.5, 1] };
/** The empty bar. */
const BAR: PerUnit = { kg: 20, lb: 45 };

const isMultiple = (value: number, step: number) =>
  Math.abs(value / step - Math.round(value / step)) < 1e-6;

/**
 * Step between weights in the user's unit: the equipment's usual one, unless the weights logged
 * (in the user's unit) aren't all on it: then the biggest step all of them are on (a gym with
 * 1.25 kg plates, dumbbells in 2.5 kg steps).
 */
export function weightStep(
  equipment: string | undefined,
  logged: number[],
  current: number | null,
  units: UnitSystem,
) {
  const unit = units === 'imperial' ? 'lb' : 'kg';
  let step = (STEPS[equipment ?? ''] ?? OTHER)[unit];
  if (equipment === 'dumbbell' && current != null && current < LIGHT_DUMBBELLS.below[unit]) {
    step = LIGHT_DUMBBELLS.step[unit];
  }
  const weights = logged.filter((w) => w > 0);
  const fits = (s: number) => weights.every((w) => isMultiple(w, s));
  if (fits(step)) return step;
  return CANDIDATES[unit].find(fits) ?? CANDIDATES[unit][CANDIDATES[unit].length - 1];
}

/** Lightest weight the equipment has: the empty bar for barbells, else none. */
export const lightestWeight = (equipment: string | undefined, units: UnitSystem) =>
  equipment === 'barbell' ? BAR[units === 'imperial' ? 'lb' : 'kg'] : 0;
