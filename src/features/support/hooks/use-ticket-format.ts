import { useTranslation } from 'react-i18next';

import { isSameDay, isYesterday, MINUTE_MS } from '@/shared/lib/date';
import { formatDate, formatShortDate, formatTime, formatWeekdayDate } from '@/shared/lib/format';

import type { TicketKind, TicketStatus } from '../data/tickets';
import { toMs } from '../lib/ticket-format';

const isJustNow = (date: Date, now: Date) => now.getTime() - date.getTime() < 2 * MINUTE_MS;

/** Localized dates, titles and status copy for tickets and the chat. */
export function useTicketFormat() {
  const { t } = useTranslation('support');
  // `now` defaults to the current time in the body, not as `now = new Date()`: the React Compiler
  // can't compile a hook with that.
  return {
    /** Row date: "Just now", "14:02", "Yesterday" or "12 Sep". */
    rowWhen(iso: string, now?: Date) {
      const date = new Date(toMs(iso));
      const at = now ?? new Date();
      if (isJustNow(date, at)) return t('when.justNow');
      if (isSameDay(date, at)) return formatTime(date);
      if (isYesterday(date, at)) return t('when.yesterday');
      return formatShortDate(date);
    },
    /** System-line time: "just now", "today 14:02", "yesterday 21:04" or "12 Sep, 21:04". */
    eventWhen(iso: string, now?: Date) {
      const date = new Date(toMs(iso));
      const at = now ?? new Date();
      if (isJustNow(date, at)) return t('chat.justNow');
      if (isSameDay(date, at)) return t('chat.todayAt', { time: formatTime(date) });
      if (isYesterday(date, at)) return t('chat.yesterdayAt', { time: formatTime(date) });
      return formatDate(date, {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
    /** Day divider: "Today", "Yesterday" or "Wed, 12 Sep". */
    day(ms: number, now?: Date) {
      const date = new Date(ms);
      const at = now ?? new Date();
      if (isSameDay(date, at)) return t('chat.today');
      if (isYesterday(date, at)) return t('chat.yesterday');
      return formatWeekdayDate(date);
    },
    /** Status pill copy; a resolved idea reads "Shipped" instead of "Fixed". */
    status: (kind: TicketKind, status: TicketStatus) =>
      kind === 'idea' && status === 'resolved' ? t('status.shipped') : t(`status.${status}`),
    /** "Ticket #1042", or a placeholder until the server has assigned the number. */
    title: (number: number | null) =>
      number === null ? t('ticketPending') : t('ticketNumber', { number }),
  };
}
