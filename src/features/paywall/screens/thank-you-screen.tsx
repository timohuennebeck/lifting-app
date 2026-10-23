import { Image } from 'expo-image';
import { Stack, useIsFocused } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { useHardwareBack } from '@/shared/hooks/use-hardware-back';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';

import { CoachVideo } from '../components/coach-video';
import { usePaywallFlow } from '../hooks/use-paywall-flow';
import { COACH } from '../lib/coach-video';

/** Thank-you after subscribing: a message from the head coach, then on to the next step. */
export function ThankYouScreen() {
  const { t } = useTranslation('paywall');
  const flow = usePaywallFlow();
  const focused = useIsFocused();
  // Purchased: there is no way back into the paywall, only on; Android's back goes on too.
  useHardwareBack(flow.exit);

  return (
    <Screen
      header={<ScreenHeader icon="close" onBack={flow.exit} action={<View />} />}
      footer={<Button label={t('welcome.cta')} onPress={flow.exit} />}
    >
      <Stack.Screen options={{ gestureEnabled: false }} />
      <View className="mx-4 mt-3 h-120 shrink">
        <CoachVideo active={focused} />
      </View>
      <View className="flex-row items-center gap-2.5 px-5 pt-5.5">
        <View className="size-9 overflow-hidden rounded-full border-[1.5px] border-accent bg-surface">
          <Image source={COACH.avatar} contentFit="cover" style={StyleSheet.absoluteFill} />
        </View>
        <View className="flex-1">
          <Text variant="label">{COACH.name}</Text>
          <Text variant="caption" tone="muted" className="font-inter text-xs leading-4">
            {t('welcome.role')}
          </Text>
        </View>
      </View>
      {/* Labels the AI-made video, as platforms ask for AI-generated people. */}
      <View className="flex-row items-center gap-2 px-5 pt-3.5">
        <View className="rounded-[5px] border-[1.5px] border-muted px-1 py-px">
          <Text
            variant="caption"
            tone="muted"
            className="font-inter-medium text-[11px] leading-3.5"
          >
            {t('welcome.aiBadge')}
          </Text>
        </View>
        <Text variant="caption" tone="muted" className="flex-1 font-inter text-xs leading-4">
          {t('welcome.aiNotice')}
        </Text>
      </View>
    </Screen>
  );
}
