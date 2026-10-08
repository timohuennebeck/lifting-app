import { createQueryKeys } from '@lukemorales/query-key-factory';

export const workoutFeatureKeys = createQueryKeys('workoutFeature', {
  exerciseSessions: (exerciseId: string) => [exerciseId],
  records: (workoutId: string) => [workoutId],
});
