import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import type { TicketSummary } from '../data/tickets';
import { useHasUnread } from '../stores/seen-store';
import { useTicketFormat } from './use-ticket-format';

/** Date, "Forge Team: …" / "You: …" preview, unread state and tap action of a ticket row. */
export function useTicketRow(ticket: TicketSummary) {
  const { t } = useTranslation('support');
  const format = useTicketFormat();
  const unread = useHasUnread(ticket.id, ticket.lastTeamAt);
  const last = ticket.lastMessage;
  const body = last?.body.replace(/\s+/g, ' ').trim();
  const text = last
    ? body || t('preview.screenshots', { count: last.attachments.length })
    : ticket.subject;
  return {
    unread,
    when: format.rowWhen(ticket.activityAt),
    preview: t(last?.author === 'team' ? 'preview.team' : 'preview.user', { text }),
    open: () => router.push({ pathname: '/support/[ticketId]', params: { ticketId: ticket.id } }),
  };
}
