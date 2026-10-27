import type { WeightEntry } from '@/shared/data/weight-entries';
import { addDays, toIsoDate } from '@/shared/lib/date';

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
