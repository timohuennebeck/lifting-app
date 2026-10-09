import { Stack } from 'expo-router';

import { colors } from '@/shared/lib/theme';

export default function BodyCheckLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen
        name="camera"
        options={{ animation: 'fade', contentStyle: { backgroundColor: 'black' } }}
      />
      <Stack.Screen name="review" />
      <Stack.Screen name="analysis" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="result/[id]" options={{ animation: 'fade', gestureEnabled: false }} />
    </Stack>
  );
}
