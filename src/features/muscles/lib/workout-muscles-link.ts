import type { Href } from 'expo-router';

interface WorkoutItem {
  exerciseId: string;
  sets: number;
}

/**
 * The muscle breakdown of a workout. Its exercises travel in the link ("bench-press:3,dips:2"),
 * so it works for saved templates, the empty workout builder and the plan import alike.
 */
export const workoutMusclesHref = (title: string, items: WorkoutItem[]): Href => ({
  pathname: '/workout-muscles',
  params: { title, items: items.map((i) => `${i.exerciseId}:${i.sets}`).join(',') },
});

export function parseWorkoutItems(param: string | undefined): WorkoutItem[] {
  if (!param) return [];
  return param.split(',').flatMap((part) => {
    const [exerciseId, sets] = part.split(':');
    return exerciseId ? [{ exerciseId, sets: Number(sets) || 0 }] : [];
  });
}
