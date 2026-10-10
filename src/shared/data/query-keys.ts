import { createQueryKeys, mergeQueryKeys } from '@lukemorales/query-key-factory';

// Core entity keys shared across features; features may add their own factories.
const profileKeys = createQueryKeys('profile', {
  current: (userId: string) => [userId],
  avatarUrl: (path: string) => [path],
});

const templateKeys = createQueryKeys('templates', {
  list: null,
  collections: null,
  detail: (templateId: string) => [templateId],
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

const bodyCheckKeys = createQueryKeys('bodyChecks', {
  list: null,
});

const exerciseCatalogKeys = createQueryKeys('exerciseCatalog', {
  changes: null,
});

export const queryKeys = mergeQueryKeys(
  profileKeys,
  templateKeys,
  workoutKeys,
  bodyCheckKeys,
  exerciseCatalogKeys,
);
