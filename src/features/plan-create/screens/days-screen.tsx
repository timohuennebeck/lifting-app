import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useDraft, useUpdateDraft } from '@/features/onboarding/stores/onboarding-store';
import { Button } from '@/shared/ui/button';
import { NumberStepper } from '@/shared/ui/number-stepper';
import { StepScreen } from '@/shared/ui/step-screen';

import { CREATE_STEPS } from '../lib/flow';

/** Default weekdays for a given number of sessions (Mon-based). */
const PRESET_DAYS: Record<number, number[]> = {
  1: [0],
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 3, 4],
  6: [0, 1, 2, 3, 4, 5],
  7: [0, 1, 2, 3, 4, 5, 6],
};

export function DaysScreen() {
  const { t } = useTranslation(['planCreate', 'common']);
  const { trainingDays } = useDraft();
  const update = useUpdateDraft();
  const count = Math.max(1, trainingDays.length);

  return (
    <StepScreen
      step={4}
      total={CREATE_STEPS}
      title={t('planCreate:days.title')}
      footer={
        <Button
          label={t('common:actions.continue')}
          onPress={() => router.push('/create/duration')}
        />
      }
    >
      <NumberStepper
        value={count}
        min={1}
        max={7}
        onChange={(next) => update({ trainingDays: PRESET_DAYS[next] })}
        format={(n) => t('planCreate:days.times', { count: n })}
        unit={t('planCreate:days.perWeek')}
      />
    </StepScreen>
  );
}
