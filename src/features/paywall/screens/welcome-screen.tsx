import { Stack, useIsFocused } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useDraft } from '@/features/onboarding/stores/onboarding-store';
import { useProfile } from '@/shared/data/profile';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';

import { CoachVideo } from '../components/coach-video';
import { usePaywallFlow } from '../hooks/use-paywall-flow';
import { COACH } from '../lib/coach-video';

/** Thank-you after subscribing: a message from the head coach, then on to the next step. */
export function WelcomeScreen() {
  const { t } = useTranslation('paywall');
  const flow = usePaywallFlow();
  const focused = useIsFocused();
  const { profile } = useProfile();
  const draftName = useDraft().firstName;
  const name = (profile?.firstName || draftName).trim();

  return (
    <Screen
      header={
        <ScreenHeader
          icon="close"
          onBack={flow.exit}
          title={
            <Text
              variant="caption"
              tone="muted"
              numberOfLines={1}
              className="text-center font-inter-medium text-sm"
            >
              {t('welcome.header')}
            </Text>
          }
          action={<View />}
        />
      }
      footer={<Button label={t('welcome.cta')} onPress={flow.exit} />}
    >
      {/* Purchased: no swiping back into the paywall. */}
      <Stack.Screen options={{ gestureEnabled: false }} />
      <View className="mx-4 mt-3 h-120 shrink">
        <CoachVideo active={focused} name={name} />
      </View>
      <View className="flex-row items-center gap-2.5 px-5 pt-5.5">
        <View className="size-9 items-center justify-center rounded-full bg-accent">
          <Text variant="caption" tone="onAccent">
            {COACH.initials}
          </Text>
        </View>
        <View className="flex-1">
          <Text variant="label">{COACH.name}</Text>
          <Text variant="caption" tone="muted" className="font-inter text-xs leading-4">
            {t('welcome.role')}
          </Text>
        </View>
      </View>
    </Screen>
  );
}
