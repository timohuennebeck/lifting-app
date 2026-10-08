import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { Sex } from '@/shared/data/profile';
import { Button } from '@/shared/ui/button';
import { OptionCard } from '@/shared/ui/option-card';

import { OnboardingStep } from '../components/onboarding-step';
import { TextButton } from '../components/text-button';
import { ABOUT_STEPS } from '../lib/flow';
import { useDraft, useUpdateDraft } from '../stores/onboarding-store';

const CARDS = ['male', 'female'] as const satisfies readonly Sex[];

export function SexScreen() {
  const { t } = useTranslation('onboarding');
  const { t: tc } = useTranslation();
  const { sex } = useDraft();
  const update = useUpdateDraft();

  return (
    <OnboardingStep
      step={2}
      total={ABOUT_STEPS}
      title={t('sex.title')}
      subtitle={t('sex.subtitle')}
      scroll
      footer={
        <Button
          label={tc('actions.continue')}
          disabled={!sex}
          onPress={() => router.push('/age')}
        />
      }
    >
      <View className="gap-2.5 px-4 pt-7">
        {CARDS.map((value, i) => (
          <OptionCard
            key={value}
            index={i + 1}
            title={t(`sex.${value}`)}
            selected={sex === value}
            onPress={() => update({ sex: value })}
          />
        ))}
        <TextButton
          label={t('sex.unspecified')}
          haptic="select"
          accessibilityRole="radio"
          accessibilityState={{ selected: sex === 'unspecified' }}
          tone={sex === 'unspecified' ? 'accent' : 'subtle'}
          textClassName="text-sm"
          onPress={() => update({ sex: 'unspecified' })}
          className="mt-1.5 min-h-11 self-center"
        />
      </View>
    </OnboardingStep>
  );
}
