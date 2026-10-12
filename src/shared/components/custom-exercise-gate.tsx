import type { ReactNode } from 'react';

import { useCustomExerciseSync } from '@/shared/data/custom-exercises';

/**
 * Renders its children once the user's own exercises are read from the local database: screens
 * look exercises up as they render, and plans and history may hold custom ones.
 */
export function CustomExerciseGate({ children }: { children: ReactNode }) {
  return useCustomExerciseSync() ? children : null;
}
