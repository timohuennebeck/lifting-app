import { Stack } from 'expo-router';

import { colors } from '@/shared/lib/theme';

export default function SupportLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
  );
}
