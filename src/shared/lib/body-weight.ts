// Body weight in one place for onboarding and the weigh-ins: stored in kg with two decimals (as
// weight_entries.weight_kg), shown and edited in the user's unit.
import { kgToLb, lbToKg, type UnitSystem } from './format';
import { clamp } from './math';

/** What the database accepts for a weigh-in (weight_entries.weight_kg). */
export const BODY_WEIGHT_LIMITS_KG = { min: 20, max: 400 } as const;
/** Before the first weigh-in: onboarding starts here, and bodyweight sets count with it. */
export const DEFAULT_BODY_WEIGHT_KG = 78;

/** The onboarding ruler, in the user's unit: half kilos or whole pounds. */
const ONBOARDING_KG = { min: 30, max: 250, step: 0.5 } as const;
const ONBOARDING_LB = { min: 66, max: 550, step: 1 } as const;

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

/** The onboarding ruler's range and step in the user's unit. */
export const onboardingWeightRange = (units: UnitSystem) =>
  units === 'imperial' ? ONBOARDING_LB : ONBOARDING_KG;

/** Stored kg → the onboarding ruler's value, on its steps and in its range. */
export function onboardingWeightValue(kg: number, units: UnitSystem) {
  const { min, max, step } = onboardingWeightRange(units);
  return clamp(snapTo(toUnits(kg, units), step), min, max);
}

/** The onboarding ruler's value → kg to store. */
export function onboardingWeightKg(value: number, units: UnitSystem) {
  const { min, max } = onboardingWeightRange(units);
  return toStoredKg(clamp(value, min, max), units);
}
