import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useDraft, useUpdateDraft } from '@/features/onboarding/stores/onboarding-store';
import { cn } from '@/shared/lib/cn';
import { haptics } from '@/shared/lib/haptics';
import { Button } from '@/shared/ui/button';
import { DialRing } from '@/shared/ui/dial-ring';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Screen } from '@/shared/ui/screen';
import { StepHeader } from '@/shared/ui/step-header';
import { Text } from '@/shared/ui/text';

import { StepTitle } from '../components/step-title';
import { usePlanGenerator } from '../hooks/use-plan-generator';
import { CREATE_STEPS, DURATION, DURATION_PRESETS } from '../lib/flow';
import { planSize } from '../lib/generate-plan';

export function DurationScreen() {
  const { t } = useTranslation(['planCreate', 'common']);
  const { sessionMinutes } = useDraft();
  const update = useUpdateDraft();
  const { generate } = usePlanGenerator();
  const size = planSize(generate());

  function set(minutes: number) {
    if (minutes === sessionMinutes) return;
    haptics.select();
    update({ sessionMinutes: minutes });
  }

  function onDial(fraction: number) {
    let next = Math.round((fraction * DURATION.max) / DURATION.step) * DURATION.step;
    // Don't jump across the 12 o'clock seam while dragging.
    if (sessionMinutes >= 100 && next < 30) next = DURATION.max;
    if (sessionMinutes <= 30 && next > 100) next = DURATION.min;
    set(Math.min(DURATION.max, Math.max(DURATION.min, next)));
  }

  return (
    <Screen
      header={<StepHeader step={5} total={CREATE_STEPS} />}
      footer={
        <Button
          label={t('common:actions.continue')}
          onPress={() => router.push('/create/building')}
        />
      }
    >
      <StepTitle title={t('planCreate:duration.title')} />
      <View className="mt-10 items-center">
        <DialRing fraction={sessionMinutes / DURATION.max} onChange={onDial}>
          <Text className="font-inter-semibold text-[72px] leading-[72px] text-fg">
            {sessionMinutes}
          </Text>
          <Text variant="overline" tone="subtle" className="mt-1 text-xs tracking-[1.7px]">
            {t('planCreate:duration.minutes')}
          </Text>
        </DialRing>
        <Text variant="label" tone="accent" className="mt-4">
          {t('planCreate:duration.estimate', size)}
        </Text>
        <Text variant="caption" tone="subtle" className="mt-1.5 font-inter">
          {t('planCreate:duration.hint')}
        </Text>
      </View>
      <View className="flex-row gap-1.5 px-4 pt-6">
        {DURATION_PRESETS.map((minutes) => {
          const on = minutes === sessionMinutes;
          return (
            <PressableScale
              key={minutes}
              haptic="none"
              accessibilityRole="radio"
              accessibilityLabel={t('planCreate:duration.presetA11y', { count: minutes })}
              accessibilityState={{ selected: on }}
              onPress={() => set(minutes)}
              className={cn(
                'h-[52px] flex-1 items-center justify-center rounded-2xl',
                on ? 'bg-accent' : 'bg-pill',
              )}
            >
              <Text variant="bodyStrong" tone={on ? 'onAccent' : 'default'}>
                {minutes}
              </Text>
            </PressableScale>
          );
        })}
      </View>
    </Screen>
  );
}
