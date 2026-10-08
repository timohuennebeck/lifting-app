import { Stack } from 'expo-router';

import { colors } from '@/shared/lib/theme';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
