import { Stack } from 'expo-router';

import { DiscardCheckSheet } from '@/features/progress-check/components/discard-check-sheet';
import { colors } from '@/shared/lib/theme';

export default function ProgressCheckLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen
          name="camera"
          options={{ animation: 'fade', contentStyle: { backgroundColor: 'black' } }}
        />
        <Stack.Screen name="assessment" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="result/[id]" options={{ animation: 'fade', gestureEnabled: false }} />
        {/* A tapped photo fades in; it closes with its X: sideways swipes go through the poses. */}
        <Stack.Screen
          name="photo/[id]"
          options={{
            animation: 'fade',
            gestureEnabled: false,
            contentStyle: { backgroundColor: 'black' },
          }}
        />
      </Stack>
      {/* Asked from any of its screens before photos are thrown away. */}
      <DiscardCheckSheet />
    </>
  );
}
