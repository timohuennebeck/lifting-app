import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ExercisePickerPage } from '@/features/exercises/components/exercise-picker-page';
import { haptics } from '@/shared/lib/haptics';

import { addExercises, editRoutineAt, swapExercise } from '../lib/edit-plan';
import { useImportStore } from '../stores/import-store';

/** Add exercises to a routine of the imported plan, or swap one. */
export function ImportPickerScreen() {
  const { mode, index } = useLocalSearchParams<{ mode?: 'add' | 'swap'; index?: string }>();
  const swap = mode === 'swap';
  const at = Number(index ?? -1);
  const { t } = useTranslation('planImport');
  const plan = useImportStore((s) => s.plan);
  const routineIndex = useImportStore((s) => s.routineIndex);
  const editPlan = useImportStore((s) => s.editPlan);
  const exercises = plan?.routines[routineIndex]?.exercises ?? [];

  function done(picked: string[]) {
    editPlan((p) =>
      editRoutineAt(p, routineIndex, (routine) =>
        swap ? swapExercise(routine, at, picked[0]) : addExercises(routine, picked),
      ),
    );
    haptics.success();
    router.back();
  }

  return (
    <ExercisePickerPage
      title={swap ? t('confirm.swap') : t('confirm.add')}
      mode={swap ? 'swap' : 'add'}
      exerciseIds={exercises.map((e) => e.exerciseId)}
      onDone={done}
    />
  );
}
