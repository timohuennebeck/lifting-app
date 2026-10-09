import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { POSES } from '@/features/body-check/lib/poses';
import { startBodyCheck } from '@/features/body-check/stores/body-check-store';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { CheckItem } from '@/shared/ui/check-item';
import { StepScreen } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';
import { TextButton } from '@/shared/ui/text-button';

import { START_STEPS } from '../lib/flow';
import { useOnboardingStore } from '../stores/onboarding-store';

const TIPS = ['light', 'clothes', 'framing', 'privacy'] as const;
/** Example full-body shot from the design (image slot "Ganzkörperfoto"). */
const EXAMPLE_PHOTO = require('@/assets/images/demo-person.jpg');

/** Ends onboarding; the root guard then swaps to the app. */
function finish(openBodyCheck: boolean) {
  if (openBodyCheck) startBodyCheck();
  useOnboardingStore.getState().complete();
  // The (app) group only exists after the guard re-rendered, so navigate on the next tick.
  if (openBodyCheck) setTimeout(() => router.push('/body-check/camera'), 50);
}

export function BodyCheckPromptScreen() {
  const { t } = useTranslation(['onboarding', 'bodyCheck']);

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
        className="mx-4 mt-5 h-82.5 overflow-hidden rounded-[28px] bg-surface"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}
      >
        <Image source={EXAMPLE_PHOTO} contentFit="cover" style={StyleSheet.absoluteFill} />
        <View className="absolute inset-x-3.5 top-3.5 flex-row gap-1.5">
          {POSES.map((pose, i) => (
            <View
              key={pose}
              className={cn(
                'h-7.5 justify-center rounded-full px-2.75',
                i === 0 ? 'bg-accent' : 'bg-elevated',
              )}
            >
              <Text variant="caption" tone={i === 0 ? 'onAccent' : 'default'} className="text-xs">
                {t(`bodyCheck:poses.${pose}.short`)}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <View className="gap-2 px-6 pt-4 pb-3">
        {TIPS.map((tip) => (
          <CheckItem key={tip}>
            {t(`bodyCheck.${tip}Strong`)}
            <Text variant="paragraph" tone="subtle">
              {t(`bodyCheck.${tip}Rest`)}
            </Text>
          </CheckItem>
        ))}
      </View>
    </StepScreen>
  );
}
