import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AGE_RANGE } from '@/shared/data/profile';
import { Button } from '@/shared/ui/button';
import { NumberStepper } from '@/shared/ui/number-stepper';
import { StepScreen } from '@/shared/ui/step-screen';

import { ABOUT_STEPS } from '../lib/flow';
import { useDraft, useUpdateDraft } from '../stores/onboarding-store';

export function AgeScreen() {
  const { t } = useTranslation('onboarding');
  const { t: tc } = useTranslation();
  const { age } = useDraft();
  const update = useUpdateDraft();

  return (
    <StepScreen
      step={3}
      total={ABOUT_STEPS}
      title={t('age.title')}
      footer={<Button label={tc('actions.continue')} onPress={() => router.push('/units')} />}
    >
      <NumberStepper
        value={age}
        onChange={(age) => update({ age })}
        min={AGE_RANGE.min}
        max={AGE_RANGE.max}
        unit={t('age.unit')}
      />
    </StepScreen>
  );
}
