import {
  isTicketActive,
  type Ticket,
  type TicketEvent,
  type TicketMessage,
  type TicketStatus,
} from '../data/tickets';
import { toMs } from './ticket-format';

export type TimelineItem =
  | { type: 'day'; key: string; at: number }
  | { type: 'message'; key: string; message: TicketMessage; priority: number | null }
  | { type: 'created'; key: string; at: string }
  | { type: 'autoReply'; key: string }
  | {
      type: 'status';
      key: string;
      status: TicketStatus;
      version: string | null;
      note: string | null;
    }
  | { type: 'reopened'; key: string; at: string };

interface TimedItem {
  at: number;
  /** Tie-breaker for items sharing a timestamp. */
  order: number;
  item: TimelineItem;
}

const ms = (iso: string | null) => (iso ? toMs(iso) || 0 : 0);
const dayKey = (at: number) => new Date(at).toDateString();

/**
 * Chat timeline: messages, the "Ticket created" line, the local auto reply after the
 * first user message (until the team answers), status changes and reopens from the
 * ticket's history, and day dividers. Tickets without a status event yet (changed before
 * the history existed) show their current status instead.
 */
export function buildTimeline(
  ticket: Ticket,
  messages: TicketMessage[],
  events: TicketEvent[],
): TimelineItem[] {
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

  // Events sort after messages sharing their timestamp.
  const last = messages.length * 3;
  const start = ms(first?.createdAt ?? ticket.createdAt);
  events.forEach((event, i) => {
    const at = Math.max(ms(event.createdAt), start);
    const item: TimelineItem =
      event.kind === 'reopened'
        ? { type: 'reopened', key: event.id, at: event.createdAt }
        : {
            type: 'status',
            key: event.id,
            status: event.status,
            version: event.version,
            note: event.note,
          };
    timed.push({ at, order: last + i, item });
  });
  if (ticket.status !== 'open' && !events.some((e) => e.kind === 'status')) {
    const closed = !isTicketActive(ticket.status);
    const at = Math.max(
      ms(closed ? (ticket.closedAt ?? ticket.updatedAt) : ticket.updatedAt),
      start,
    );
    const item: TimelineItem = {
      type: 'status',
      key: 'status',
      status: ticket.status,
      version: null,
      note: null,
    };
    timed.push({ at, order: last + events.length, item });
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
