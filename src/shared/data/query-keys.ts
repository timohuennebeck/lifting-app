import { createQueryKeys, mergeQueryKeys } from '@lukemorales/query-key-factory';

// Core entity keys shared across features; features may add their own factories.
const profileKeys = createQueryKeys('profile', {
  current: (userId: string) => [userId],
  avatarUrl: (path: string) => [path],
});

const planKeys = createQueryKeys('plans', {
  list: null,
  latestWeek: (planId: string) => [planId],
  routineOrder: (planId: string) => [planId],
});

const routineKeys = createQueryKeys('routines', {
  list: null,
  detail: (routineId: string) => [routineId],
});

const workoutKeys = createQueryKeys('workouts', {
  active: null,
  detail: (workoutId: string) => [workoutId],
  history: (limit: number) => [limit],
  count: null,
  range: (fromIso: string, toIso: string) => [fromIso, toIso],
  exerciseHistory: (exerciseId: string) => [exerciseId],
  lastExerciseSession: (exerciseId: string) => [exerciseId],
  muscleVolume: (sinceIso: string) => [sinceIso],
});

const progressCheckKeys = createQueryKeys('progressChecks', {
  list: null,
});

const exerciseCatalogKeys = createQueryKeys('exerciseCatalog', {
  changes: null,
});

const customExerciseKeys = createQueryKeys('customExercises', {
  list: null,
  logged: (exerciseId: string) => [exerciseId],
});

const weightKeys = createQueryKeys('weight', {
  entries: null,
});

export const queryKeys = mergeQueryKeys(
  profileKeys,
  planKeys,
  routineKeys,
  workoutKeys,
  progressCheckKeys,
  exerciseCatalogKeys,
  customExerciseKeys,
  weightKeys,
);
