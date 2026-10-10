import { getExercise } from '@/shared/data/exercises';
import { type MuscleShare, muscleShares } from '@/shared/data/muscles';
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
function muscleWeights(exerciseId: string) {
  const muscles = getExercise(exerciseId)?.muscles ?? {};
  return (Object.entries(muscles) as [MuscleId, number][]).sort((a, b) => b[1] - a[1]);
}

/** Splits an exercise's muscles into primary (≥ 30 % or the top one) and secondary. */
export function splitMuscles(exerciseId: string) {
  const entries = muscleWeights(exerciseId);
  return {
    primary: entries.filter(([, w], i) => i === 0 || w >= 0.3).map(([m]) => m),
    secondary: entries.filter(([, w], i) => i > 0 && w < 0.3).map(([m]) => m),
  };
}

/** Below this share of a workout a muscle is secondary, even where an exercise targets it. */
const WORKOUT_PRIMARY_MIN_PERCENT = 10;

/**
 * A workout's muscles by share, split like an exercise's: primary where at least one exercise
 * targets them directly and they get a real part of the work, secondary otherwise. Only the
 * grouping; the shares are the same as everywhere else.
 */
export function workoutMuscleSplit(items: { exerciseId: string; sets: number }[]) {
  const targeted = new Set(
    items.filter((i) => i.sets > 0).flatMap((i) => splitMuscles(i.exerciseId).primary),
  );
  const isPrimary = (s: MuscleShare) =>
    targeted.has(s.muscle) && s.percent >= WORKOUT_PRIMARY_MIN_PERCENT;
  const shares = muscleShares(items);
  return { primary: shares.filter(isPrimary), secondary: shares.filter((s) => !isPrimary(s)) };
}

/** Group of the exercise's main muscle; core for an exercise without muscles. */
export function primaryGroup(exerciseId: string): MuscleGroupId {
  const muscle = muscleWeights(exerciseId)[0]?.[0];
  return muscle ? groupOfMuscle(muscle) : 'core';
}
