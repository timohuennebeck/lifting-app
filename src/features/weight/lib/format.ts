import { toUnits } from '@/shared/lib/body-weight';
import { formatNumber, type UnitSystem } from '@/shared/lib/format';

/** A body weight in the user's unit with one decimal, without the unit: "82,7". */
export const formatBodyWeight = (kg: number, units: UnitSystem) =>
  formatNumber(toUnits(kg, units), 1, 1);

/** A change with one decimal and its sign, without the unit: "−0,4", "+0,6" or "±0,0". */
export function formatChange(kg: number, units: UnitSystem) {
  const value = Math.round(toUnits(kg, units) * 10) / 10;
  const sign = value > 0 ? '+' : value < 0 ? '−' : '±';
  return `${sign}${formatNumber(Math.abs(value), 1, 1)}`;
}
