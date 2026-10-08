import { Stack } from 'expo-router';

import { colors } from '@/shared/lib/theme';

export default function TemplateLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="[id]/sets/[exerciseId]" options={{ presentation: 'fullScreenModal' }} />
    </Stack>
  );
}
