import { router, useIsFocused } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useProfile } from '@/shared/data/profile';
import { useFooterInset } from '@/shared/hooks/use-footer-inset';
import { Button } from '@/shared/ui/button';
import { CheckChip } from '@/shared/ui/check-item';
import { Text } from '@/shared/ui/text';
import { TextButton } from '@/shared/ui/text-button';

import { track } from '@/shared/lib/posthog';

import { LanguagePicker } from '../components/language-picker';
import { PhotoBackdrop } from '../components/photo-backdrop';
import { useOnboardingStore } from '../stores/onboarding-store';

const FEATURES = ['import', 'create', 'progress'] as const;
/** Placeholder until the design's photo is in. */
const PHOTO = require('@/assets/images/demo-person.jpg');

/** 00: the first screen, full screen over a borderless photo: what Traqa does, then start. */
export function WelcomeScreen() {
  const { t } = useTranslation('onboarding');
  const insets = useSafeAreaInsets();
  const footerInset = useFooterInset();

  // A signed-in user who already finished onboarding (e.g. app killed on the last step).
  // Only while focused: this screen stays mounted under the flow, and Create Account
  // sets onboarded_at before the progress-check prompt, which must still be shown.
  const { profile } = useProfile();
  const focused = useIsFocused();
  useEffect(() => {
    if (focused && profile?.onboardedAt) useOnboardingStore.getState().complete();
  }, [focused, profile?.onboardedAt]);

  return (
    <View className="flex-1 bg-bg">
      <PhotoBackdrop source={PHOTO} />
      <View className="absolute right-4 z-10" style={{ top: insets.top + 6 }}>
        <LanguagePicker />
      </View>
      {/* 30pt to the link text as in 00-B2; its 48pt touch area already covers 13pt. */}
      <View className="flex-1 justify-end px-5" style={{ paddingBottom: footerInset - 13 }}>
        <Text
          variant="title"
          accessibilityRole="header"
          className="text-[32px] leading-9.5 tracking-[-0.3px]"
        >
          {t('welcome.headline')}
          {'\n'}
          <Text variant="title" tone="accent" className="text-[32px] leading-9.5 tracking-[-0.3px]">
            {t('welcome.headlineAccent')}
          </Text>
        </Text>
        <Text variant="body" tone="muted" className="mt-3 text-base leading-5.75">
          {t('welcome.subtitle')}
        </Text>
        <View className="mt-4.5 flex-row flex-wrap gap-2">
          {FEATURES.map((feature) => (
            <CheckChip key={feature} label={t(`welcome.features.${feature}`)} />
          ))}
        </View>
        <Button
          label={t('welcome.start')}
          onPress={() => {
            track('onboarding:flow_start');
            router.push('/name');
          }}
          className="mt-6.5"
        />
        <TextButton
          className="mt-1 self-center"
          onPress={() => router.push('/sign-in')}
          prefix={t('welcome.haveAccount')}
          label={t('welcome.signIn')}
        />
      </View>
    </View>
  );
}
