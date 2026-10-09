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
    </Stack>
  );
}
