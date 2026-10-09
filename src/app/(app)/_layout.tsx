import { Stack } from 'expo-router';

import { usePhotoUploadQueue } from '@/features/body-check/hooks/use-photo-upload-queue';
import { useAttachmentUploadQueue } from '@/features/support/hooks/use-attachment-upload-queue';
import { useSyncAccountLanguage } from '@/shared/hooks/use-sync-account-language';
import { colors } from '@/shared/lib/theme';

export default function AppLayout() {
  // Background uploads of body check photos and ticket screenshots, also after restarts.
  usePhotoUploadQueue();
  useAttachmentUploadQueue();
  useSyncAccountLanguage();

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="workout/[id]"
        options={{ presentation: 'fullScreenModal', gestureEnabled: false }}
      />
      <Stack.Screen
        name="workout/summary/[id]"
        options={{ presentation: 'fullScreenModal', gestureEnabled: false }}
      />
      <Stack.Screen name="workout/history/[exerciseId]" options={{ presentation: 'modal' }} />
      <Stack.Screen
        name="body-check"
        options={{ presentation: 'fullScreenModal', gestureEnabled: false }}
      />
      <Stack.Screen
        name="pro"
        options={{ presentation: 'fullScreenModal', gestureEnabled: false }}
      />
      <Stack.Screen name="support" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
