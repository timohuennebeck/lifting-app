import type { SetValues } from '@/shared/lib/format';

/**
 * A set's estimated one-rep max in kg, as the records rank sets (Epley: weight × (1 + reps / 30));
 * null without weight or reps.
 */
function oneRepMaxKg({ weightKg, reps }: Pick<SetValues, 'weightKg' | 'reps'>) {
  if (!weightKg || !reps) return null;
  return weightKg * (1 + reps / 30);
}

/** The best estimated one-rep max of a session's sets in kg, or null. */
export function sessionOneRepMaxKg(sets: Pick<SetValues, 'weightKg' | 'reps'>[]) {
  let best: number | null = null;
  for (const set of sets) {
    const kg = oneRepMaxKg(set);
    if (kg != null && (best == null || kg > best)) best = kg;
  }
  return best;
}
