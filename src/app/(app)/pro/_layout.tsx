import { Stack } from 'expo-router';

import { colors } from '@/shared/lib/theme';

/** Traqa Pro flow (paywall → trial → thank you) opened from Settings. */
export default function ProLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.bg },
      }}
    />
  );
}
