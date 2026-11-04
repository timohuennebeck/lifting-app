import { useExerciseImagePreload } from '@/shared/hooks/use-exercise-image-preload';

/** Its own component, so a catalog change doesn't re-render the root layout. */
export function ExerciseImagePreload() {
  useExerciseImagePreload();
  return null;
}
