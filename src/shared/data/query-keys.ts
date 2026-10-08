import { createQueryKeys, mergeQueryKeys } from '@lukemorales/query-key-factory';

// Core entity keys shared across features; features may add their own factories.
export const profileKeys = createQueryKeys('profile', {
  current: (userId: string) => [userId],
});

export const templateKeys = createQueryKeys('templates', {
  list: null,
  collections: null,
  detail: (templateId: string) => [templateId],
});

export const workoutKeys = createQueryKeys('workouts', {
  active: null,
  detail: (workoutId: string) => [workoutId],
  history: null,
  range: (fromIso: string, toIso: string) => [fromIso, toIso],
  exerciseHistory: (exerciseId: string) => [exerciseId],
  muscleVolume: (sinceIso: string) => [sinceIso],
});

export const bodyCheckKeys = createQueryKeys('bodyChecks', {
  list: null,
});

export const queryKeys = mergeQueryKeys(profileKeys, templateKeys, workoutKeys, bodyCheckKeys);
