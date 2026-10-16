import { Stack } from 'expo-router';

import { colors } from '@/shared/lib/theme';

/** Traqa Pro flow (paywall → thank you), from Settings or the subscription gate. */
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
