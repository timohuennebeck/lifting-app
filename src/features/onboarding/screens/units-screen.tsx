import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { UnitSystem } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { OptionCard } from '@/shared/ui/option-card';
import { Text } from '@/shared/ui/text';

import { OnboardingStep } from '../components/onboarding-step';
import { ABOUT_STEPS } from '../lib/flow';
import { useDraft, useUpdateDraft } from '../stores/onboarding-store';

const OPTIONS = [
  { value: 'metric', badge: 'KG' },
  { value: 'imperial', badge: 'LB' },
] as const satisfies readonly { value: UnitSystem; badge: string }[];

export function UnitsScreen() {
  const { t } = useTranslation('onboarding');
  const { t: tc } = useTranslation();
  const { unitSystem } = useDraft();
  const update = useUpdateDraft();

  return (
    <OnboardingStep
      step={4}
      total={ABOUT_STEPS}
      title={t('units.title')}
      scroll
      footer={<Button label={tc('actions.continue')} onPress={() => router.push('/weight')} />}
    >
      <View className="gap-2.5 px-4 pt-8">
        {OPTIONS.map(({ value, badge }) => {
          const selected = unitSystem === value;
          return (
            <OptionCard
              key={value}
              title={t(`units.${value}`)}
              description={t(`units.${value}Hint`)}
              selected={selected}
              onPress={() => update({ unitSystem: value })}
              leading={
                <View
                  className={cn(
                    'size-12 items-center justify-center rounded-full',
                    selected ? 'bg-accent' : 'bg-pill',
                  )}
                >
                  <Text
                    variant="label"
                    tone={selected ? 'onAccent' : 'default'}
                    className="text-base"
                  >
                    {badge}
                  </Text>
                </View>
              }
            />
          );
        })}
      </View>
    </OnboardingStep>
  );
}
