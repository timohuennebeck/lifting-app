import { Stack } from 'expo-router';

import { colors } from '@/shared/lib/theme';

export default function SupportLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      {/* Listed first: the first screen is the stack's start. */}
      <Stack.Screen name="index" />
      {/* A tapped screenshot fades in instead of sliding. */}
      <Stack.Screen name="screenshot" options={{ animation: 'fade', gestureEnabled: false }} />
    </Stack>
  );
}
