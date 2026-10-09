import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ExercisePickerPage } from '@/features/exercises/components/exercise-picker-page';
import { haptics } from '@/shared/lib/haptics';

import { addExercises, editDayAt, swapExercise } from '../lib/edit-plan';
import { useImportStore } from '../stores/import-store';

/** Add exercises to a day of the imported plan, or swap one. */
export function ImportPickerScreen() {
  const { mode, index } = useLocalSearchParams<{ mode?: 'add' | 'swap'; index?: string }>();
  const swap = mode === 'swap';
  const at = Number(index ?? -1);
  const { t } = useTranslation('planImport');
  const plan = useImportStore((s) => s.plan);
  const dayIndex = useImportStore((s) => s.dayIndex);
  const editPlan = useImportStore((s) => s.editPlan);
  const exercises = plan?.days[dayIndex]?.exercises ?? [];

  function done(picked: string[]) {
    editPlan((p) =>
      editDayAt(p, dayIndex, (day) =>
        swap ? swapExercise(day, at, picked[0]) : addExercises(day, picked),
      ),
    );
    haptics.success();
    router.back();
  }

  return (
    <ExercisePickerPage
      title={swap ? t('confirm.swap') : t('confirm.add')}
      mode={swap ? 'swap' : 'add'}
      items={exercises.map((e, i) => ({
        key: String(i),
        exerciseId: e.exerciseId,
        sets: e.sets.length,
      }))}
      swapKey={swap ? String(at) : undefined}
      onDone={done}
    />
  );
}
