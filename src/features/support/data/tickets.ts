import { parseJson } from '@/shared/data/json';
import type { Database } from '@/shared/data/powersync/schema';
import { useSqlQuery } from '@/shared/data/use-sql-query';

import { supportKeys } from './support-keys';

export type TicketKind = 'bug' | 'idea';
export type TicketStatus = 'open' | 'planned' | 'resolved' | 'closed';
export type MessageAuthor = 'user' | 'team';

/** Open and planned tickets still await the team; resolved and closed ones are done. */
export const isTicketActive = (status: TicketStatus) => status === 'open' || status === 'planned';

export interface Ticket {
  id: string;
  /** Human-readable number, assigned by the server; null until synced back. */
  number: number | null;
  kind: TicketKind;
  status: TicketStatus;
  priority: number | null;
  subject: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  author: MessageAuthor;
  body: string;
  /** Storage paths in the ticket-attachments bucket. */
  attachments: string[];
  createdAt: string;
}

export interface TicketSummary extends Ticket {
  lastMessage: Pick<TicketMessage, 'author' | 'body' | 'attachments' | 'createdAt'> | null;
  lastTeamAt: string | null;
  /** Latest message time (or the ticket's update), for sorting and the row date. */
  activityAt: string;
  /** Lower-cased number, subject and message bodies for the search field. */
  searchText: string;
}

type TicketRow = Database['tickets'] & { id: string };
type MessageRow = Database['ticket_messages'] & { id: string };

interface SummaryRow extends TicketRow {
  last_author: string | null;
  last_body: string | null;
  last_attachments: string | null;
  last_at: string | null;
  last_team_at: string | null;
  bodies: string | null;
}

const toTicket = (r: TicketRow): Ticket => ({
  id: r.id,
  number: r.number,
  kind: r.kind === 'idea' ? 'idea' : 'bug',
  status: (r.status as TicketStatus | null) ?? 'open',
  priority: r.priority,
  subject: r.subject ?? '',
  createdAt: r.created_at ?? '',
  updatedAt: r.updated_at ?? r.created_at ?? '',
  closedAt: r.closed_at,
});

const toSummaries = (rows: SummaryRow[]): TicketSummary[] =>
  rows.map((r) => {
    const ticket = toTicket(r);
    return {
      ...ticket,
      lastMessage: r.last_at
        ? {
            author: r.last_author === 'team' ? 'team' : 'user',
            body: r.last_body ?? '',
            attachments: parseJson<string[]>(r.last_attachments, []),
            createdAt: r.last_at,
          }
        : null,
      lastTeamAt: r.last_team_at,
      activityAt: r.last_at ?? ticket.updatedAt,
      searchText: `#${r.number ?? ''} ${ticket.subject} ${r.bodies ?? ''}`.toLowerCase(),
    };
  });

const toTicketOrNull = (rows: TicketRow[]) => (rows[0] ? toTicket(rows[0]) : null);

const toMessages = (rows: MessageRow[]): TicketMessage[] =>
  rows.map((r) => ({
    id: r.id,
    ticketId: r.ticket_id ?? '',
    author: r.author === 'team' ? 'team' : 'user',
    body: r.body ?? '',
    attachments: parseJson<string[]>(r.attachments, []),
    createdAt: r.created_at ?? '',
  }));

/** All of the user's tickets with their latest message, most recent activity first. */
export function useTickets() {
  return useSqlQuery({
    queryKey: supportKeys.tickets.queryKey,
    sql: `SELECT t.*, m.author AS last_author, m.body AS last_body,
              m.attachments AS last_attachments, m.created_at AS last_at,
              (SELECT MAX(created_at) FROM ticket_messages
                WHERE ticket_id = t.id AND author = 'team') AS last_team_at,
              (SELECT group_concat(body, ' ') FROM ticket_messages WHERE ticket_id = t.id) AS bodies
            FROM tickets t
            LEFT JOIN ticket_messages m ON m.id = (
              SELECT id FROM ticket_messages WHERE ticket_id = t.id
              ORDER BY created_at DESC, id DESC LIMIT 1)
            ORDER BY COALESCE(m.created_at, t.updated_at) DESC`,
    map: toSummaries,
  });
}

export function useTicket(ticketId: string) {
  return useSqlQuery({
    queryKey: supportKeys.ticket(ticketId).queryKey,
    sql: 'SELECT * FROM tickets WHERE id = ?',
    parameters: [ticketId],
    map: toTicketOrNull,
  });
}

/** The chat of one ticket, oldest first. Team replies arrive through sync. */
export function useTicketMessages(ticketId: string) {
  return useSqlQuery({
    queryKey: supportKeys.messages(ticketId).queryKey,
    sql: 'SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at, id',
    parameters: [ticketId],
    map: toMessages,
  });
}
