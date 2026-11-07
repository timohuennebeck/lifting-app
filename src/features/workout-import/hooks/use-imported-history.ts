import { importedHistory } from '../lib/imported';
import { useWorkoutImportStore } from '../stores/workout-import-store';
import { useSetScore } from './use-set-score';

/**
 * An exercise's sessions from the import just made, for its history before the account has them
 * (onboarding keeps them until sign-up; in the app they arrive with the next sync). Only worked
 * out while `needed` (nothing stored yet).
 */
export function useImportedHistory(exerciseId: string, needed: boolean) {
  const imported = useWorkoutImportStore((s) => s.imported);
  const score = useSetScore();
  return imported && needed ? importedHistory(imported.workouts, exerciseId, score) : [];
}
