import { useTranslation } from 'react-i18next';

import { addDays, isSameDay, MINUTE_MS, startOfDay } from '@/shared/lib/date';
import { formatDate, formatShortDate } from '@/shared/lib/format';

import type { TicketKind, TicketStatus } from '../data/tickets';
import { toMs } from '../lib/ticket-format';

const clock = (date: Date) => formatDate(date, { hour: '2-digit', minute: '2-digit' });
const isYesterday = (date: Date, now: Date) => isSameDay(date, addDays(startOfDay(now), -1));
const isJustNow = (date: Date, now: Date) => now.getTime() - date.getTime() < 2 * MINUTE_MS;

/** Localized dates, titles and status copy for tickets and the chat. */
export function useTicketFormat() {
  const { t } = useTranslation('support');
  return {
    /** Row date: "Just now", "14:02", "Yesterday" or "12 Sep". */
    rowWhen(iso: string, now = new Date()) {
      const date = new Date(toMs(iso));
      if (isJustNow(date, now)) return t('when.justNow');
      if (isSameDay(date, now)) return clock(date);
      if (isYesterday(date, now)) return t('when.yesterday');
      return formatShortDate(date);
    },
    /** System-line time: "just now", "today 14:02", "yesterday 21:04" or "12 Sep, 21:04". */
    eventWhen(iso: string, now = new Date()) {
      const date = new Date(toMs(iso));
      if (isJustNow(date, now)) return t('chat.justNow');
      if (isSameDay(date, now)) return t('chat.todayAt', { time: clock(date) });
      if (isYesterday(date, now)) return t('chat.yesterdayAt', { time: clock(date) });
      return formatDate(date, {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
    /** Day divider: "Today", "Yesterday" or "Wed, 12 Sep". */
    day(ms: number, now = new Date()) {
      const date = new Date(ms);
      if (isSameDay(date, now)) return t('chat.today');
      if (isYesterday(date, now)) return t('chat.yesterday');
      return formatDate(date, { weekday: 'short', day: 'numeric', month: 'short' });
    },
    /** Status pill copy; a resolved idea reads "Shipped" instead of "Fixed". */
    status: (kind: TicketKind, status: TicketStatus) =>
      kind === 'idea' && status === 'resolved' ? t('status.shipped') : t(`status.${status}`),
    /** "Ticket #1042", or a placeholder until the server has assigned the number. */
    title: (number: number | null) =>
      number === null ? t('ticketPending') : t('ticketNumber', { number }),
  };
}
