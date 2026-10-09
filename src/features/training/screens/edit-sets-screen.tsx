import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useTemplateDetail } from '@/shared/data/templates';
import { haptics } from '@/shared/lib/haptics';
import { requireUserId } from '@/shared/stores/session-store';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';

import { SetTargetsForm } from '../components/set-targets-form';
import { saveTemplateSets } from '../data/template-mutations';

/** Edit target sets of one template exercise: reps range, RIR, rest override (00·P2 C·S). */
export function EditSetsScreen() {
  const { id, exerciseId } = useLocalSearchParams<{ id: string; exerciseId: string }>();
  const { t } = useTranslation('training');
  const { data: template } = useTemplateDetail(id);
  const exercise = template?.exercises.find((e) => e.id === exerciseId);

  return (
    // Title only, as in 00·P2 C·S; the exercise is known from the previous screen.
    <Screen header={<ScreenHeader title={t('sets.title')} />}>
      {exercise ? (
        <SetTargetsForm
          key={exercise.id}
          exerciseId={exercise.exerciseId}
          initialSets={exercise.sets.map((s) => ({
            key: s.id,
            targetMin: s.target_min,
            targetMax: s.target_max,
            rir: s.rir ?? null,
          }))}
          initialRest={exercise.restSeconds}
          onSave={async (sets, rest) => {
            await saveTemplateSets(requireUserId(), exercise.id, sets, rest);
            haptics.success();
            router.back();
          }}
        />
      ) : null}
    </Screen>
  );
}
