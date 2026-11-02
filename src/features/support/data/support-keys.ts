import { createQueryKeys } from '@lukemorales/query-key-factory';

export const supportKeys = createQueryKeys('support', {
  tickets: (language: string) => [language],
  ticket: (ticketId: string) => [ticketId],
  messages: (ticketId: string, language: string) => [ticketId, language],
  events: (ticketId: string) => [ticketId],
  attachmentUrl: (path: string) => [path],
});
