import { formatNumber, kgToLb, type UnitSystem } from '@/shared/lib/format';

/** kg in the user's unit, unrounded. */
export const inUnits = (kg: number, units: UnitSystem) => (units === 'imperial' ? kgToLb(kg) : kg);

/** A body weight with one decimal, without the unit: "82,7". */
export const formatKg = (kg: number, units: UnitSystem) => formatNumber(inUnits(kg, units), 1, 1);

/** A change with one decimal and its sign, without the unit: "−0,4", "+0,6" or "0,0". */
export function formatChange(kg: number, units: UnitSystem) {
  const value = Math.round(inUnits(kg, units) * 10) / 10;
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${formatNumber(Math.abs(value), 1, 1)}`;
}
