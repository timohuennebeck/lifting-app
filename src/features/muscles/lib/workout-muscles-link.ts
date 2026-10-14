import type { Href } from 'expo-router';

import type { ExerciseItem } from '@/shared/data/routines';

/**
 * The muscle breakdown of a workout. Its exercises travel in the link ("bench-press:3,dips:2"),
 * so it works for saved routines, the empty workout builder and the plan import alike.
 */
export const workoutMusclesHref = (title: string, items: ExerciseItem[]): Href => ({
  pathname: '/workout-muscles',
  params: { title, items: items.map((i) => `${i.exerciseId}:${i.sets}`).join(',') },
});

export function parseWorkoutItems(param: string | undefined): ExerciseItem[] {
  if (!param) return [];
  return param.split(',').flatMap((part) => {
    const [exerciseId, sets] = part.split(':');
    return exerciseId ? [{ exerciseId, sets: Number(sets) || 0 }] : [];
  });
}
