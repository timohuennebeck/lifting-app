import { Stack } from 'expo-router';

import { colors } from '@/shared/lib/theme';

export default function AppLayout() {
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
    </Stack>
  );
}
