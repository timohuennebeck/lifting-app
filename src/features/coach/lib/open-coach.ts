import { router } from 'expo-router';

import { isAnswering, openChat, useCoachStore } from '../stores/coach-store';

/** Opens the coach on a new chat, or on the one whose answer is still coming in. */
export function openCoach() {
  const { pending } = useCoachStore.getState();
  openChat(isAnswering(pending) ? pending.chatId : null);
  router.push('/coach');
}
