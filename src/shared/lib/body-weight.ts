// Body weight in one place: stored in kg with two decimals (as weight_entries.weight_kg), shown
// and edited in the user's unit.
import { kgToLb, lbToKg, type UnitSystem } from './format';

/** What the database accepts for a weigh-in (weight_entries.weight_kg). */
export const BODY_WEIGHT_LIMITS_KG = { min: 20, max: 400 } as const;
/** Before the first weigh-in: onboarding starts here, and bodyweight sets count with it. */
export const DEFAULT_BODY_WEIGHT_KG = 78;

/** kg in the user's unit (kg or lb), unrounded. */
export const toUnits = (kg: number, units: UnitSystem) => (units === 'imperial' ? kgToLb(kg) : kg);

/**
 * A weight in the user's unit as kg to store: two decimals, so 180 lb comes back as 180.0 lb
 * (one decimal of kg would bring it back as 179.9).
 */
export const toStoredKg = (value: number, units: UnitSystem) =>
  Math.round((units === 'imperial' ? lbToKg(value) : value) * 100) / 100;

/** A value on a ruler's steps, without float noise. */
export const snapTo = (value: number, step: number) =>
  +(Math.round(value / step) * step).toFixed(2);
