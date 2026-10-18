import { Stack } from 'expo-router';

import { colors } from '@/shared/lib/theme';

export default function MealsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      {/* Listed first: the first screen is the stack's start. */}
      <Stack.Screen name="index" />
    </Stack>
  );
}
