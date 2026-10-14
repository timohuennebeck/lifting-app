import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ExercisePickerPage } from '@/features/exercises/components/exercise-picker-page';
import { useRoutineDetail } from '@/shared/data/routines';
import { haptics } from '@/shared/lib/haptics';
import { requireUserId } from '@/shared/stores/session-store';

import { addRoutineExercise, swapRoutineExercise } from '../data/routine-mutations';

/** Add exercises to a routine, or swap one. */
export function RoutinePickerScreen() {
  const { id, mode, routineExerciseId } = useLocalSearchParams<{
    id: string;
    mode?: 'add' | 'swap';
    routineExerciseId?: string;
  }>();
  const swap = mode === 'swap';
  const { t } = useTranslation(['training', 'exercises']);
  const { data: routine } = useRoutineDetail(id);
  const exercises = routine?.exercises ?? [];

  async function done(picked: string[]) {
    if (swap) {
      if (routineExerciseId) await swapRoutineExercise(routineExerciseId, picked[0]);
    } else {
      const userId = requireUserId();
      for (const exerciseId of picked) await addRoutineExercise(userId, id, exerciseId);
    }
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
