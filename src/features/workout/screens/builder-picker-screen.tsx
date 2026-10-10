import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ExercisePickerPage } from '@/features/exercises/components/exercise-picker-page';
import { haptics } from '@/shared/lib/haptics';

import { useWorkoutDraftStore } from '../stores/workout-draft-store';

/** Add exercises to the empty workout being put together, or swap one. */
export function BuilderPickerScreen() {
  const { mode, index } = useLocalSearchParams<{ mode?: 'add' | 'swap'; index?: string }>();
  const swap = mode === 'swap';
  const { t } = useTranslation('training');
  const exercises = useWorkoutDraftStore((s) => s.exercises);

  function done(picked: string[]) {
    const draft = useWorkoutDraftStore.getState();
    if (swap) draft.swap(Number(index ?? -1), picked[0]);
    else draft.add(picked);
    haptics.success();
    router.back();
  }

  return (
    <ExercisePickerPage
      title={swap ? t('overview.swapTitle') : t('overview.addExercise')}
      mode={swap ? 'swap' : 'add'}
      exerciseIds={exercises.map((e) => e.exerciseId)}
      onDone={done}
    />
  );
}
