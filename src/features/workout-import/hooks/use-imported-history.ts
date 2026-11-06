import { importedHistory } from '../lib/imported';
import { useWorkoutImportStore } from '../stores/workout-import-store';

/**
 * An exercise's sessions from the import just made, for its history before the account has them
 * (onboarding keeps them until sign-up; in the app they arrive with the next sync).
 */
export function useImportedHistory(exerciseId: string) {
  const imported = useWorkoutImportStore((s) => s.imported);
  return imported ? importedHistory(imported.workouts, exerciseId) : [];
}
