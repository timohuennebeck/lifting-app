import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { MuscleMap } from '@/shared/ui/muscle-map/muscle-map';
import { Text } from '@/shared/ui/text';
import { StepScreen } from '@/shared/ui/step-screen';
import { TextButton } from '@/shared/ui/text-button';

import { START_STEPS } from '../lib/flow';
import { useOnboardingStore } from '../stores/onboarding-store';

const POSES = ['front', 'left', 'right', 'back'] as const;
const TIPS = ['light', 'clothes', 'framing', 'privacy'] as const;

/** Ends onboarding; the root guard then swaps to the app. */
function finish(openBodyCheck: boolean) {
  useOnboardingStore.getState().complete();
  // The (app) group only exists after the guard re-rendered, so navigate on the next tick.
  if (openBodyCheck) setTimeout(() => router.navigate('/body'), 50);
}

export function BodyCheckPromptScreen() {
  const { t } = useTranslation('onboarding');

  return (
    <StepScreen
      step={3}
      total={START_STEPS}
      title={t('bodyCheck.title')}
      subtitle={t('bodyCheck.subtitle')}
      scroll
      footer={
        <View className="gap-1">
          <Button label={t('bodyCheck.now')} onPress={() => finish(true)} />
          <TextButton label={t('bodyCheck.later')} tone="secondary" onPress={() => finish(false)} />
        </View>
      }
    >
      <View
        className="mx-4 mt-5 h-[330px] overflow-hidden rounded-[28px] bg-surface"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}
      >
        <View className="absolute inset-0 pt-14 pb-4 opacity-80">
          <MuscleMap view="front" />
        </View>
        <View className="absolute inset-x-3.5 top-3.5 flex-row gap-1.5">
          {POSES.map((pose, i) => (
            <View
              key={pose}
              className={cn(
                'h-[30px] justify-center rounded-full px-[11px]',
                i === 0 ? 'bg-accent' : 'bg-elevated',
              )}
            >
              <Text variant="caption" tone={i === 0 ? 'onAccent' : 'default'} className="text-xs">
                {t(`bodyCheck.${pose}`)}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <View className="gap-2 px-6 pt-4 pb-3">
        {TIPS.map((tip) => (
          <View key={tip} className="flex-row items-center gap-3">
            <View className="size-[26px] items-center justify-center rounded-full bg-accent">
              <Icon name="check" size={12} color={colors.onAccent} />
            </View>
            <Text variant="label" className="flex-1">
              {t(`bodyCheck.${tip}Strong`)}
              <Text variant="paragraph" tone="subtle">
                {t(`bodyCheck.${tip}Rest`)}
              </Text>
            </Text>
          </View>
        ))}
      </View>
    </StepScreen>
  );
}
