import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { startProgressCheck } from '@/features/progress-check/stores/progress-check-store';
import { useFooterInset } from '@/shared/hooks/use-footer-inset';
import { Button } from '@/shared/ui/button';
import { CameraAccessSheet, useCameraAccess } from '@/shared/ui/camera/camera-access-sheet';
import { CheckChip } from '@/shared/ui/check-item';
import { PhotoBackdrop } from '@/shared/ui/photo-backdrop';
import { StepHeader } from '@/shared/ui/step-header';
import { StepTitle } from '@/shared/ui/step-screen';
import { TextButton } from '@/shared/ui/text-button';

import { START_STEPS } from '../lib/flow';
import { useOnboardingStore } from '../stores/onboarding-store';

const TIPS = ['light', 'clothes', 'framing', 'same', 'privacy'] as const;
/** Placeholder until the design's photo is in (image slot "Ganzkörperfoto"). */
const PHOTO = require('@/assets/images/demo-person.jpg');

/** Ends onboarding; the root guard then swaps to the app. */
function finish(openProgressCheck: boolean) {
  if (openProgressCheck) startProgressCheck();
  useOnboardingStore.getState().complete();
  // The (app) group only exists after the guard re-rendered, so navigate on the next tick.
  if (openProgressCheck) setTimeout(() => router.push('/progress-check/camera'), 50);
}

/**
 * 08·0A: the progress check offer, full screen over a borderless photo, with the tips as pills.
 */
export function ProgressCheckPromptScreen() {
  const { t } = useTranslation(['onboarding', 'progressCheck']);
  const camera = useCameraAccess(() => finish(true));
  const insets = useSafeAreaInsets();
  const footerInset = useFooterInset();

  return (
    <View className="flex-1 bg-bg">
      <PhotoBackdrop source={PHOTO} />
      <View style={{ paddingTop: insets.top }}>
        <StepHeader step={3} total={START_STEPS} />
      </View>
      <View className="flex-1 justify-end" style={{ paddingBottom: footerInset }}>
        <StepTitle title={t('progressCheck.title')} subtitle={t('progressCheck.subtitle')} />
        <View className="flex-row flex-wrap gap-2 px-5 pt-4.5">
          {TIPS.map((tip) => (
            <CheckChip key={tip} label={t(`progressCheck.${tip}Strong`)} />
          ))}
        </View>
        <View className="gap-1 px-4 pt-6.5">
          <Button label={t('progressCheck.now')} onPress={camera.request} />
          <TextButton
            label={t('progressCheck.later')}
            tone="secondary"
            onPress={() => finish(false)}
          />
        </View>
      </View>
      <CameraAccessSheet {...camera.sheet} body={t('progressCheck:camera.access')} />
    </View>
  );
}
