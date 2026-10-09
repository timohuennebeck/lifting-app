import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useDraft, useUpdateDraft } from '@/features/onboarding/stores/onboarding-store';
import { haptics } from '@/shared/lib/haptics';
import { clamp } from '@/shared/lib/math';
import { Button } from '@/shared/ui/button';
import { DialRing } from '@/shared/ui/dial-ring';
import { StepScreen } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';

import { CREATE_STEPS, DURATION } from '../lib/flow';

export function DurationScreen() {
  const { t } = useTranslation(['planCreate', 'common']);
  const { sessionMinutes } = useDraft();
  const update = useUpdateDraft();

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
    set(clamp(next, DURATION.min, DURATION.max));
  }

  return (
    <StepScreen
      step={5}
      total={CREATE_STEPS}
      title={t('planCreate:duration.title')}
      footer={
        <Button
          label={t('common:actions.continue')}
          onPress={() => router.push('/create/building')}
        />
      }
    >
      <View className="mt-12.5 items-center">
        <DialRing fraction={sessionMinutes / DURATION.max} onChange={onDial}>
          <Text className="font-inter-semibold text-[72px] leading-18 text-fg">
            {sessionMinutes}
          </Text>
          <Text variant="overline" tone="subtle" className="mt-1 text-xs tracking-[1.7px]">
            {t('planCreate:duration.minutes')}
          </Text>
        </DialRing>
        <Text variant="caption" tone="subtle" className="mt-4 font-inter">
          {t('planCreate:duration.hint')}
        </Text>
      </View>
    </StepScreen>
  );
}
