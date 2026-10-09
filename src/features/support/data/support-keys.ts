import { createQueryKeys } from '@lukemorales/query-key-factory';

export const supportKeys = createQueryKeys('support', {
  tickets: null,
  ticket: (ticketId: string) => [ticketId],
  messages: (ticketId: string) => [ticketId],
  attachmentUrl: (path: string) => [path],
});
