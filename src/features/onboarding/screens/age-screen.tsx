import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/ui/button';
import { NumberStepper } from '@/shared/ui/number-stepper';

import { OnboardingStep } from '../components/onboarding-step';
import { ABOUT_STEPS, AGE_RANGE } from '../lib/flow';
import { useDraft, useUpdateDraft } from '../stores/onboarding-store';

export function AgeScreen() {
  const { t } = useTranslation('onboarding');
  const { t: tc } = useTranslation();
  const { age } = useDraft();
  const update = useUpdateDraft();

  return (
    <OnboardingStep
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
        className="px-5 pt-9"
      />
    </OnboardingStep>
  );
}
