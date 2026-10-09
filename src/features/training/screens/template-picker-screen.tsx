import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ExercisePickerPage } from '@/features/exercises/components/exercise-picker-page';
import { useTemplateDetail } from '@/shared/data/templates';
import { haptics } from '@/shared/lib/haptics';
import { requireUserId } from '@/shared/stores/session-store';

import { addTemplateExercise, swapTemplateExercise } from '../data/template-mutations';

/** Add exercises to a template, or swap one. */
export function TemplatePickerScreen() {
  const { id, mode, templateExerciseId } = useLocalSearchParams<{
    id: string;
    mode?: 'add' | 'swap';
    templateExerciseId?: string;
  }>();
  const swap = mode === 'swap';
  const { t } = useTranslation(['training', 'exercises']);
  const { data: template } = useTemplateDetail(id);
  const exercises = template?.exercises ?? [];

  async function done(picked: string[]) {
    if (swap) {
      if (templateExerciseId) await swapTemplateExercise(templateExerciseId, picked[0]);
    } else {
      const userId = requireUserId();
      for (const exerciseId of picked) await addTemplateExercise(userId, id, exerciseId);
    }
    haptics.success();
    router.back();
  }

  return (
    <ExercisePickerPage
      title={swap ? t('overview.swapTitle') : t('overview.addExercise')}
      mode={swap ? 'swap' : 'add'}
      items={exercises.map((e) => ({ key: e.id, exerciseId: e.exerciseId, sets: e.sets.length }))}
      swapKey={templateExerciseId}
      onDone={done}
    />
  );
}
