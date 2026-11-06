import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ExercisePickerPage } from '@/features/exercises/components/exercise-picker-page';
import { haptics } from '@/shared/lib/haptics';

import { useWorkoutImportStore } from '../stores/workout-import-store';

/** "Andere Übung suchen" on a check (15a): any exercise for the name, then back to the check. */
export function CheckSearchScreen() {
  const { t } = useTranslation('workoutImport');
  const { name } = useLocalSearchParams<{ name: string }>();
  const decide = useWorkoutImportStore((s) => s.decide);

  function done(picked: string[]) {
    if (picked[0] && name) decide(name, { kind: 'exercise', exerciseId: picked[0] });
    haptics.success();
    router.back();
  }

  return (
    <ExercisePickerPage title={t('check.searchTitle')} mode="swap" exerciseIds={[]} onDone={done} />
  );
}
