import { getExercise } from '@/shared/data/exercises';
import type { BodyPartId, MuscleId } from '@/shared/ui/muscle-map/body-paths';

export const MUSCLE_GROUP_IDS = [
  'chest',
  'back',
  'shoulders',
  'arms',
  'core',
  'glutes',
  'legs',
] as const;
export type MuscleGroupId = (typeof MUSCLE_GROUP_IDS)[number];

/** Coarse body areas used for focus chips and the exercise library filter. */
export const MUSCLE_GROUPS: Record<MuscleGroupId, readonly MuscleId[]> = {
  chest: ['chest'],
  back: ['lats', 'upper_back', 'traps', 'lower_back'],
  shoulders: ['front_delts', 'side_delts', 'rear_delts'],
  arms: ['biceps', 'triceps', 'forearms'],
  core: ['abs', 'obliques'],
  glutes: ['glutes'],
  legs: ['quads', 'hamstrings', 'adductors', 'calves', 'tibialis'],
};

/** Group a tapped body part belongs to; null for the neck and joints (not focus areas). */
export function groupOfPart(part: BodyPartId): MuscleGroupId | null {
  return (
    MUSCLE_GROUP_IDS.find((g) => (MUSCLE_GROUPS[g] as readonly BodyPartId[]).includes(part)) ?? null
  );
}

/** Group used to file exercises; the neck counts as back. */
export function groupOfMuscle(muscle: MuscleId): MuscleGroupId {
  return groupOfPart(muscle) ?? 'back';
}

/** Muscles of an exercise with their weights, highest share first. */
export function muscleWeights(exerciseId: string) {
  const muscles = getExercise(exerciseId)?.muscles ?? {};
  return (Object.entries(muscles) as [MuscleId, number][]).sort((a, b) => b[1] - a[1]);
}

/** Muscles of an exercise, highest share first. */
export function exerciseMuscles(exerciseId: string): MuscleId[] {
  return muscleWeights(exerciseId).map(([m]) => m);
}

export function primaryGroup(exerciseId: string): MuscleGroupId {
  const muscle = exerciseMuscles(exerciseId)[0];
  return muscle ? groupOfMuscle(muscle) : 'core';
}
