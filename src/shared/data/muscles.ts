import { type MuscleId, MUSCLE_IDS } from '@/shared/ui/muscle-map/body-paths';

import { getExercise } from './exercises';

export type MuscleRegion = 'upper' | 'lower';

export const MUSCLE_REGION: Record<MuscleId, MuscleRegion> = {
  abs: 'upper',
  biceps: 'upper',
  chest: 'upper',
  forearms: 'upper',
  front_delts: 'upper',
  lats: 'upper',
  lower_back: 'upper',
  neck: 'upper',
  obliques: 'upper',
  rear_delts: 'upper',
  side_delts: 'upper',
  traps: 'upper',
  triceps: 'upper',
  upper_back: 'upper',
  adductors: 'lower',
  calves: 'lower',
  glutes: 'lower',
  hamstrings: 'lower',
  quads: 'lower',
  tibialis: 'lower',
};

export interface MuscleShare {
  muscle: MuscleId;
  /** Share of total work, 0–100, rounded. */
  percent: number;
}

/**
 * Distributes set counts over muscles using each exercise's muscle weights.
 * Returns muscles sorted by share, highest first; untouched muscles are omitted.
 */
export function muscleShares(items: { exerciseId: string; sets: number }[]): MuscleShare[] {
  const load = new Map<MuscleId, number>();
  for (const { exerciseId, sets } of items) {
    // Exercises without sets (e.g. skipped in a finished workout) trained nothing.
    if (sets <= 0) continue;
    const muscles = getExercise(exerciseId)?.muscles ?? {};
    for (const [muscle, weight] of Object.entries(muscles) as [MuscleId, number][]) {
      load.set(muscle, (load.get(muscle) ?? 0) + weight * sets);
    }
  }
  const total = [...load.values()].reduce((sum, v) => sum + v, 0);
  if (!total) return [];
  return MUSCLE_IDS.filter((m) => load.has(m))
    .map((muscle) => ({ muscle, percent: Math.round(((load.get(muscle) ?? 0) / total) * 100) }))
    .sort((a, b) => b.percent - a.percent);
}
