import { router } from 'expo-router';

import { openChat, useCoachStore } from '../stores/coach-store';

/** Opens the coach on a new chat, or on the one whose answer is still coming in. */
export function openCoach() {
  const { pending } = useCoachStore.getState();
  const answering = !!pending && !pending.done;
  openChat(answering ? pending.chatId : null);
  router.push('/coach');
}
