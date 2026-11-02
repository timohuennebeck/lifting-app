import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { haptics } from '@/shared/lib/haptics';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';

import type { SetDraft } from './set-editor-row';
import { SetTargetsForm } from './set-targets-form';

export interface SetTargetsScreenProps {
  /** The exercise whose sets are edited; the page stays empty until it is there. */
  exercise:
    { key?: string; exerciseId: string; sets: SetDraft[]; restSeconds: number | null } | undefined;
  onSave: (sets: SetDraft[], rest: number | null) => Promise<void> | void;
}

/**
 * The target sets of an exercise as a page (00·P2 C·S): the title only, as the exercise is known
 * from the screen before. Saved, it goes back with a tick; a save that fails stays.
 */
export function SetTargetsScreen({ exercise, onSave }: SetTargetsScreenProps) {
  const { t } = useTranslation('training');
  return (
    <Screen header={<ScreenHeader title={t('sets.title')} />}>
      {exercise ? (
        <SetTargetsForm
          key={exercise.key}
          exerciseId={exercise.exerciseId}
          initialSets={exercise.sets}
          initialRest={exercise.restSeconds}
          onSave={async (sets, rest) => {
            await onSave(sets, rest);
            haptics.success();
            router.back();
          }}
        />
      ) : null}
    </Screen>
  );
}
