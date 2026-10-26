import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { SetTargetsForm } from '@/features/training/components/set-targets-form';
import { haptics } from '@/shared/lib/haptics';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';

import { editExerciseAt, editRoutineAt } from '../lib/edit-plan';
import { useImportStore } from '../stores/import-store';

/** Target sets of an exercise in the plan being imported, made or edited (as for routines). */
export function ImportSetsScreen() {
  const { index } = useLocalSearchParams<{ index: string }>();
  const at = Number(index);
  const { t } = useTranslation('training');
  const routineIndex = useImportStore((s) => s.routineIndex);
  const exercise = useImportStore((s) => s.plan?.routines[routineIndex]?.exercises[at]);

  return (
    <Screen header={<ScreenHeader title={t('sets.title')} />}>
      {exercise ? (
        <SetTargetsForm
          key={exercise.key}
          exerciseId={exercise.exerciseId}
          initialSets={exercise.sets.map((set, k) => ({ ...set, key: String(k) }))}
          initialRest={exercise.restSeconds}
          onSave={async (sets, rest) => {
            useImportStore.getState().editPlan((p) =>
              editRoutineAt(p, routineIndex, (r) =>
                editExerciseAt(r, at, (e) => ({
                  ...e,
                  sets: sets.map(({ key: _key, ...set }) => set),
                  restSeconds: rest,
                })),
              ),
            );
            haptics.success();
            router.back();
          }}
        />
      ) : null}
    </Screen>
  );
}
