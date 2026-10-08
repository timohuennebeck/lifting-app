import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useProfile } from '@/shared/data/profile';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';

import { LanguagePicker } from '../components/language-picker';
import { TextButton } from '../components/text-button';
import { WelcomePreview } from '../components/welcome-preview';
import { useOnboardingStore } from '../stores/onboarding-store';

const PHONE_HEIGHT = 404;
const PHONE_TOP = 58;

export function WelcomeScreen() {
  const { t } = useTranslation('onboarding');
  const insets = useSafeAreaInsets();
  const [heroHeight, setHeroHeight] = useState(0);
  const scale = heroHeight ? Math.min(1, (heroHeight - PHONE_TOP - 16) / PHONE_HEIGHT) : 1;

  // A signed-in user who already finished onboarding (e.g. app killed on the last step).
  const { profile } = useProfile();
  useEffect(() => {
    if (profile?.onboardedAt) useOnboardingStore.getState().complete();
  }, [profile?.onboardedAt]);

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <View
        className="flex-1 items-center"
        style={{ paddingTop: PHONE_TOP * Math.min(1, scale) }}
        onLayout={(e) => setHeroHeight(e.nativeEvent.layout.height)}
      >
        <View style={{ transform: [{ scale: Math.max(0.5, scale) }], transformOrigin: 'top' }}>
          <WelcomePreview />
        </View>
      </View>
      <View className="absolute right-4 z-10" style={{ top: insets.top + 6 }}>
        <LanguagePicker />
      </View>
      <View className="items-center px-5" style={{ paddingBottom: insets.bottom + 16 }}>
        <Text
          variant="title"
          accessibilityRole="header"
          className="text-center text-[32px] leading-8 tracking-[-0.3px]"
        >
          {t('welcome.headline')}
          {'\n'}
          <Text variant="title" tone="accent" className="text-[32px] leading-8 tracking-[-0.3px]">
            {t('welcome.headlineAccent')}
          </Text>
        </Text>
        <Text
          variant="body"
          tone="muted"
          className="mt-3.5 max-w-80 text-center text-base leading-[23px]"
        >
          {t('welcome.subtitle')}
        </Text>
        <Button
          label={t('welcome.start')}
          onPress={() => router.push('/name')}
          className="mt-[26px] self-stretch"
        />
        <TextButton
          className="mt-1"
          onPress={() => router.push('/sign-in')}
          label={
            <>
              <Text variant="label" tone="muted" className="font-inter">
                {t('welcome.haveAccount')}
              </Text>
              {t('welcome.signIn')}
            </>
          }
        />
      </View>
    </View>
  );
}
