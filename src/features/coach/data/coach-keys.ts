import { createQueryKeys } from '@lukemorales/query-key-factory';

export const coachKeys = createQueryKeys('coach', {
  chats: null,
  messages: (chatId: string) => [chatId],
  workouts: null,
});
