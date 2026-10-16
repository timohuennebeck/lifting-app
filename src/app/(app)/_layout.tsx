import { Stack } from 'expo-router';

import { LegalUpdateGate } from '@/features/legal/components/legal-update-gate';
import { useSubscriptionGate } from '@/features/paywall/hooks/use-subscription-gate';
import { useAttachmentUploadQueue } from '@/features/support/hooks/use-attachment-upload-queue';
import { useSyncAccountLanguage } from '@/shared/hooks/use-sync-account-language';
import { colors } from '@/shared/lib/theme';

export default function AppLayout() {
  // Background uploads of ticket screenshots, also after restarts.
  useAttachmentUploadQueue();
  useSyncAccountLanguage();
  // The whole app is Pro: without a subscription only the paywall, the account and a running
  // workout stay open (see useSubscriptionGate).
  useSubscriptionGate();

  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="workout/[id]" options={{ gestureEnabled: false }} />
        <Stack.Screen name="workout/summary/[id]" options={{ gestureEnabled: false }} />
        <Stack.Screen name="progress-check" options={{ gestureEnabled: false }} />
        <Stack.Screen name="pro" options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="support" />
        <Stack.Screen name="search" options={{ animation: 'slide_from_right' }} />
      </Stack>
      {/* Above every screen while a new legal version needs the user's consent. */}
      <LegalUpdateGate />
    </>
  );
}
