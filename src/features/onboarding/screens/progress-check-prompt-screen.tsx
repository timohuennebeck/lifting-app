import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { startProgressCheck } from '@/features/progress-check/stores/progress-check-store';
import { Button } from '@/shared/ui/button';
import { CameraAccessSheet, useCameraAccess } from '@/shared/ui/camera/camera-access-sheet';
import { CheckChip } from '@/shared/ui/check-item';
import { StepScreen } from '@/shared/ui/step-screen';
import { TextButton } from '@/shared/ui/text-button';

import { START_STEPS } from '../lib/flow';
import { useOnboardingStore } from '../stores/onboarding-store';

const TIPS = ['light', 'clothes', 'framing', 'privacy'] as const;
/** Placeholder until the design's gym photo is in. */
const PHOTO = require('@/assets/images/demo-person.jpg');

/** Ends onboarding; the root guard then swaps to the app. */
function finish(openProgressCheck: boolean) {
  if (openProgressCheck) startProgressCheck();
  useOnboardingStore.getState().complete();
  // The (app) group only exists after the guard re-rendered, so navigate on the next tick.
  if (openProgressCheck) setTimeout(() => router.push('/progress-check/camera'), 50);
}

/**
 * 08·0A: the progress check offer as the onboarding's last step, with the tips as pills over a
 * photo card. The card shrinks on short screens, so the buttons always stay in view.
 */
export function ProgressCheckPromptScreen() {
  const { t } = useTranslation(['onboarding', 'progressCheck']);
  const camera = useCameraAccess(() => finish(true));

  return (
    <StepScreen
      step={3}
      total={START_STEPS}
      title={t('progressCheck.title')}
      subtitle={t('progressCheck.subtitle')}
      footer={
        <View className="gap-1">
          <Button label={t('progressCheck.now')} onPress={camera.request} />
          <TextButton
            label={t('progressCheck.later')}
            tone="secondary"
            onPress={() => finish(false)}
          />
        </View>
      }
    >
      <View className="mx-4 mt-5 max-h-83 flex-1 overflow-hidden rounded-[22px] bg-surface">
        <Image source={PHOTO} contentFit="cover" style={StyleSheet.absoluteFill} />
        <View className="absolute inset-x-3.5 bottom-3.5 flex-row flex-wrap gap-2">
          {TIPS.map((tip) => (
            <CheckChip key={tip} label={t(`progressCheck.${tip}`)} />
          ))}
        </View>
      </View>
      <CameraAccessSheet {...camera.sheet} body={t('progressCheck:camera.access')} />
    </StepScreen>
  );
}
