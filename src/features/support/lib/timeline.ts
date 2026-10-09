import type { Ticket, TicketMessage } from '../data/tickets';
import { toMs } from './ticket-format';

export type TimelineItem =
  | { type: 'day'; key: string; at: number }
  | { type: 'message'; key: string; message: TicketMessage; priority: number | null }
  | { type: 'created'; key: string; at: string }
  | { type: 'autoReply'; key: string }
  | { type: 'planned'; key: string }
  | { type: 'done'; key: string; status: 'resolved' | 'closed' };

interface TimedItem {
  at: number;
  /** Tie-breaker for items sharing a timestamp. */
  order: number;
  item: TimelineItem;
}

const ms = (iso: string | null) => (iso ? toMs(iso) || 0 : 0);
const dayKey = (at: number) => new Date(at).toDateString();

/**
 * Chat timeline: messages, the "Ticket created" line and, until the team answers, the
 * local auto reply after the first user message, the current status (planned at its update time, resolved/closed at
 * the closing time) and day dividers. Status history is not stored, so only the current
 * status appears.
 */
export function buildTimeline(ticket: Ticket, messages: TicketMessage[]): TimelineItem[] {
  const timed: TimedItem[] = [];
  const first = messages.find((m) => m.author === 'user');
  const answered = messages.some((m) => m.author === 'team');
  messages.forEach((message, i) => {
    const at = ms(message.createdAt);
    const isFirst = message === first;
    const priority = isFirst && ticket.kind === 'idea' ? ticket.priority : null;
    timed.push({ at, order: i * 3, item: { type: 'message', key: message.id, message, priority } });
    if (!isFirst) return;
    timed.push({
      at,
      order: i * 3 + 1,
      item: { type: 'created', key: 'created', at: message.createdAt },
    });
    if (!answered)
      timed.push({ at, order: i * 3 + 2, item: { type: 'autoReply', key: 'auto-reply' } });
  });

  const start = ms(first?.createdAt ?? ticket.createdAt);
  const last = messages.length * 3;
  if (ticket.status === 'planned') {
    const at = Math.max(ms(ticket.updatedAt), start);
    timed.push({ at, order: last, item: { type: 'planned', key: 'status' } });
  } else if (ticket.status === 'resolved' || ticket.status === 'closed') {
    const at = Math.max(ms(ticket.closedAt ?? ticket.updatedAt), start);
    timed.push({ at, order: last, item: { type: 'done', key: 'status', status: ticket.status } });
  }

  timed.sort((a, b) => a.at - b.at || a.order - b.order);
  const items: TimelineItem[] = [];
  let day = '';
  for (const { at, item } of timed) {
    if (dayKey(at) !== day) {
      day = dayKey(at);
      items.push({ type: 'day', key: `day-${day}`, at });
    }
    items.push(item);
  }
  return items;
}
