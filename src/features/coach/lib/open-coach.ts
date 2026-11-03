import { type Href, router } from 'expo-router';

import { isAnswering, useCoachStore } from '../stores/coach-store';

/** The coach on a saved chat; without one, on a new chat. Each opens as a screen of its own. */
export const openCoachChat = (chatId: string | null) =>
  router.push(chatId ? { pathname: '/coach', params: { chat: chatId } } : '/coach');

/** The answer still coming in, followed from where it was asked until its chat has an id. */
const answerRoute = (pending: { chatId: string | null; screen: string }): Href =>
  pending.chatId
    ? { pathname: '/coach', params: { chat: pending.chatId } }
    : { pathname: '/coach', params: { asker: pending.screen } };

/** Opens the coach on a new chat, or on the one whose answer is still coming in. */
export function openCoach() {
  const { pending } = useCoachStore.getState();
  router.push(isAnswering(pending) ? answerRoute(pending) : '/coach');
}
