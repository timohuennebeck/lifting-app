import type { WeightEntry } from '@/shared/data/weight-entries';
import { addDays, toIsoDate } from '@/shared/lib/date';
import { formatWeight, type UnitSystem } from '@/shared/lib/format';

/** How far back an entry still counts as the weight at a check: about the week it was in. */
const MAX_DAYS_BEFORE = 7;

/**
 * The weight at a check taken at `createdAt`: that day's entry, else the latest of the week
 * before; undefined without one. `entries` oldest first.
 */
export function weightAt(entries: WeightEntry[], createdAt: string) {
  const taken = new Date(createdAt);
  const day = toIsoDate(taken);
  const from = toIsoDate(addDays(taken, -MAX_DAYS_BEFORE));
  let weight: number | undefined;
  for (const entry of entries) {
    if (entry.date > day) break;
    if (entry.date >= from) weight = entry.weightKg;
  }
  return weight;
}

/** The weight at a check as the app writes it, "79,6 kg"; undefined without one. */
export function checkWeightLabel(entries: WeightEntry[], createdAt: string, units: UnitSystem) {
  const kg = weightAt(entries, createdAt);
  return kg === undefined ? undefined : formatWeight(kg, units);
}
