import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { startProgressCheck } from '@/features/progress-check/stores/progress-check-store';
import { useHardwareBack } from '@/shared/hooks/use-hardware-back';
import { track } from '@/shared/lib/posthog';
import { Button } from '@/shared/ui/button';
import { CameraAccessSheet, useCameraAccess } from '@/shared/ui/camera/camera-access-sheet';
import { CheckChip } from '@/shared/ui/check-item';
import { StepScreen } from '@/shared/ui/step-screen';
import { TextButton } from '@/shared/ui/text-button';

import { START_STEPS } from '../lib/flow';
import { useOnboardingStore } from '../stores/onboarding-store';

const TIPS = ['light', 'clothes', 'framing'] as const;

/** Ends onboarding; the root guard then swaps to the app. */
function finish(openProgressCheck: boolean) {
  if (openProgressCheck) startProgressCheck();
  track('onboarding:flow_complete', { progress_check: openProgressCheck ? 'now' : 'later' });
  useOnboardingStore.getState().complete();
  // The (app) group only exists after the guard re-rendered, so navigate on the next tick.
  if (openProgressCheck) setTimeout(() => router.push('/progress-check/camera'), 50);
}

/**
 * 08·0A: the progress check offer as the onboarding's last step, with the tips as pills below
 * the title.
 */
export function ProgressCheckPromptScreen() {
  const { t } = useTranslation(['onboarding', 'progressCheck']);
  const camera = useCameraAccess(() => finish(true));
  // Right after sign-up: Android's back doesn't go back to it either.
  useHardwareBack(() => {});

  return (
    <StepScreen
      step={START_STEPS}
      total={START_STEPS}
      onClose={() => finish(false)}
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
      <View className="flex-row flex-wrap gap-2 px-4 pt-5">
        {TIPS.map((tip) => (
          <CheckChip key={tip} label={t(`progressCheck.${tip}`)} />
        ))}
      </View>
      <CameraAccessSheet {...camera.sheet} body={t('progressCheck:camera.access')} />
    </StepScreen>
  );
}
