import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useDraft, useUpdateDraft } from '@/features/onboarding/stores/onboarding-store';
import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { haptics } from '@/shared/lib/haptics';
import { Button } from '@/shared/ui/button';
import { DialRing } from '@/shared/ui/dial-ring';
import { StepScreen } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';

import { useCreateStep } from '../hooks/use-create-step';
import { clampMinutes, SESSION_MINUTES as DURATION } from '../lib/plan-answers';

export function DurationScreen() {
  const { t } = useTranslation(['planCreate', 'common']);
  const counter = useCreateStep('duration');
  const { step } = usePlanFlow();
  // A length saved before the 30-minute minimum shows within the range.
  const sessionMinutes = clampMinutes(useDraft().sessionMinutes);
  const update = useUpdateDraft();

  function set(minutes: number) {
    if (minutes === sessionMinutes) return;
    haptics.select();
    update({ sessionMinutes: minutes });
  }

  // The whole ring spans the range: empty at 30 minutes (12 o'clock), full at 120.
  const range = DURATION.max - DURATION.min;
  const shown = (sessionMinutes - DURATION.min) / range;

  function onDial(fraction: number) {
    let at = fraction;
    // Don't jump across the 12 o'clock seam while dragging.
    if (shown > 0.75 && at < 0.25) at = 1;
    if (shown < 0.25 && at > 0.75) at = 0;
    const steps = Math.round((at * range) / DURATION.step);
    set(clampMinutes(DURATION.min + steps * DURATION.step));
  }

  return (
    <StepScreen
      {...counter}
      title={t('planCreate:duration.title')}
      footer={
        <Button
          label={t('common:actions.continue')}
          onPress={() => {
            update({ sessionMinutes });
            router.push(step('/create/building'));
          }}
        />
      }
    >
      <View className="mt-12.5 items-center">
        <DialRing fraction={shown} onChange={onDial}>
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
