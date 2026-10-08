import type { UnitSystem } from '@/shared/lib/format';

export const CM_PER_INCH = 2.54;

/** 70 → 5′10″ */
export function feetInches(totalInches: number) {
  const inches = Math.round(totalInches);
  return `${Math.floor(inches / 12)}′${inches % 12}″`;
}

/** "178 cm" or "5′10″" depending on the unit system. */
export function formatHeight(cm: number, units: UnitSystem) {
  return units === 'imperial' ? feetInches(cm / CM_PER_INCH) : `${Math.round(cm)} cm`;
}
