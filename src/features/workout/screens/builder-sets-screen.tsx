import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { SetTargetsForm } from '@/features/training/components/set-targets-form';
import { haptics } from '@/shared/lib/haptics';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';

import { useWorkoutDraftStore } from '../stores/workout-draft-store';

/** Target sets of an exercise in the empty workout being put together (as for templates). */
export function BuilderSetsScreen() {
  const { index } = useLocalSearchParams<{ index: string }>();
  const at = Number(index);
  const { t } = useTranslation('training');
  const exercise = useWorkoutDraftStore((s) => s.exercises[at]);

  return (
    <Screen header={<ScreenHeader title={t('sets.title')} />}>
      {exercise ? (
        <SetTargetsForm
          exerciseId={exercise.exerciseId}
          initialSets={exercise.sets.map((set, k) => ({ ...set, key: String(k) }))}
          initialRest={exercise.restSeconds ?? null}
          onSave={async (sets, rest) => {
            useWorkoutDraftStore.getState().setSets(
              at,
              sets.map(({ key: _key, ...set }) => set),
              rest,
            );
            haptics.success();
            router.back();
          }}
        />
      ) : null}
    </Screen>
  );
}
