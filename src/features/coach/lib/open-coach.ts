import { type Href, router } from 'expo-router';

import { isAnswering, useCoachStore } from '../stores/coach-store';

/** The coach on a saved chat, as a screen of its own. */
export const openCoachChat = (chatId: string) =>
  router.push({ pathname: '/coach', params: { chat: chatId } });

/** A new chat starts on the Training tab's card: back there, with its field in focus. */
export function startNewChat() {
  useCoachStore.setState({ focusCard: true });
  router.dismissTo('/');
}

/** The answer still coming in, followed from where it was asked until its chat has an id. */
const answerRoute = (pending: { chatId: string | null; screen: string }): Href =>
  pending.chatId
    ? { pathname: '/coach', params: { chat: pending.chatId } }
    : { pathname: '/coach', params: { asker: pending.screen } };

/** Opens the chat whose answer is still coming in. */
export function openAnswer() {
  const { pending } = useCoachStore.getState();
  if (isAnswering(pending)) router.push(answerRoute(pending));
}
