import { Stack } from 'expo-router';

import { colors } from '@/shared/lib/theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      {/* Listed first: the first screen is where onboarding starts. */}
      <Stack.Screen name="index" />
      {/* The paywall fades in instead of sliding like a regular step. */}
      <Stack.Screen name="paywall/index" options={{ animation: 'fade' }} />
      {/* After sign-up: the account exists, so no way back to it. */}
      <Stack.Screen name="action-button" options={{ gestureEnabled: false }} />
      <Stack.Screen name="progress-check" options={{ gestureEnabled: false }} />
      {/* Reading a file: no swiping back; Android's back asks before it stops. */}
      <Stack.Screen name="import/reading" options={{ animation: 'fade', gestureEnabled: false }} />
    </Stack>
  );
}
