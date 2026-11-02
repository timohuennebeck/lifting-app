import { Stack } from 'expo-router';

import { colors } from '@/shared/lib/theme';

/** The Coach tab: the chat, with the earlier chats pushed over it. */
export default function CoachLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
  );
}
