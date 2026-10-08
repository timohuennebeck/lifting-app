import { getExercise } from '@/shared/data/exercises';
import { formatNumber, kgToLb, lbToKg, type UnitSystem } from '@/shared/lib/format';

const round = (value: number, step: number) => Math.round(value / step) * step;

/** kg → value shown in the user's unit (lb rounded to 0.5). */
export const toDisplayWeight = (kg: number, units: UnitSystem) =>
  units === 'imperial' ? round(kgToLb(kg), 0.5) : round(kg, 0.01);

export const fromDisplayWeight = (value: number, units: UnitSystem) =>
  units === 'imperial' ? lbToKg(value) : value;

/** Plate increment for the ± chips, in display units. */
export function weightStepFor(exerciseId: string, units: UnitSystem) {
  const step = getExercise(exerciseId)?.weightStep || 2.5;
  if (units === 'imperial') return step >= 2 ? 5 : 2.5;
  return step;
}

/** "60" / "57,5" in display units, without the unit label. */
export const formatWeightValue = (kg: number, units: UnitSystem) =>
  formatNumber(toDisplayWeight(kg, units), 2);

/** The locale's decimal separator ("," or "."). */
export const decimalSeparator = () => formatNumber(1.5).replace(/\d/g, '') || '.';
