import { Stack } from 'expo-router';

import { usePhotoUploadQueue } from '@/features/body-check/hooks/use-photo-upload-queue';
import { colors } from '@/shared/lib/theme';

export default function AppLayout() {
  // Resumes body check photo uploads left over from earlier sessions.
  usePhotoUploadQueue();

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
