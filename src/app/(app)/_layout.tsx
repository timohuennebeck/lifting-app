import { Stack } from 'expo-router';

import { usePhotoUploadQueue } from '@/features/body-check/hooks/use-photo-upload-queue';
import { LegalUpdateGate } from '@/features/legal/components/legal-update-gate';
import { useAttachmentUploadQueue } from '@/features/support/hooks/use-attachment-upload-queue';
import { useSyncAccountLanguage } from '@/shared/hooks/use-sync-account-language';
import { colors } from '@/shared/lib/theme';

export default function AppLayout() {
  // Background uploads of body check photos and ticket screenshots, also after restarts.
  usePhotoUploadQueue();
  useAttachmentUploadQueue();
  useSyncAccountLanguage();

  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="workout/[id]" options={{ gestureEnabled: false }} />
        <Stack.Screen name="workout/summary/[id]" options={{ gestureEnabled: false }} />
        <Stack.Screen name="body-check" options={{ gestureEnabled: false }} />
        <Stack.Screen name="pro" options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="support" />
        <Stack.Screen name="search" options={{ animation: 'slide_from_right' }} />
      </Stack>
      {/* Above every screen while a new legal version needs the user's consent. */}
      <LegalUpdateGate />
    </>
  );
}
