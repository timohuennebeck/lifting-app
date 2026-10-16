import { type MuscleId, MUSCLE_IDS } from '@/shared/ui/muscle-map/body-paths';

import { type Exercise, getExercise, isCardio } from './exercises';
import type { ExerciseItem } from './routines';

export interface MuscleShare {
  muscle: MuscleId;
  /** Share of total work, 0–100, rounded. */
  percent: number;
}

/** Muscles sorted by share of the total load, highest first; untouched muscles are omitted. */
function toShares(load: Map<MuscleId, number>): MuscleShare[] {
  const total = [...load.values()].reduce((sum, v) => sum + v, 0);
  if (!total) return [];
  return MUSCLE_IDS.filter((m) => load.has(m))
    .map((muscle) => ({ muscle, percent: Math.round(((load.get(muscle) ?? 0) / total) * 100) }))
    .sort((a, b) => b.percent - a.percent);
}

/** An exercise's muscles with their weights, as the catalog lists them. */
export const muscleWeights = (exercise: Exercise | undefined) =>
  Object.entries(exercise?.muscles ?? {}) as [MuscleId, number][];

/**
 * Distributes set counts over muscles using each exercise's muscle weights, highest share
 * first. Cardio is left out: a treadmill run isn't leg training.
 */
export function muscleShares(items: ExerciseItem[]): MuscleShare[] {
  const load = new Map<MuscleId, number>();
  for (const { exerciseId, sets } of items) {
    // Exercises without sets (e.g. skipped in a finished workout) trained nothing.
    if (sets <= 0 || isCardio(exerciseId)) continue;
    for (const [muscle, weight] of muscleWeights(getExercise(exerciseId))) {
      load.set(muscle, (load.get(muscle) ?? 0) + weight * sets);
    }
  }
  return toShares(load);
}

/** The muscles one exercise works, by share; cardio too, for its own page. */
export const exerciseShares = (exercise: Exercise | undefined) =>
  toShares(new Map(muscleWeights(exercise)));
