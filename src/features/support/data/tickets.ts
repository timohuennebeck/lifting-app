import { and, desc, eq, getTableColumns, max, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';

import { parseJson } from '@/shared/data/json';
import { drizzle } from '@/shared/data/powersync/database';
import {
  ticketEvents,
  type TicketEventRecord,
  ticketMessages,
  tickets,
  type TicketMessageRecord,
  type TicketRecord,
} from '@/shared/data/powersync/schema';
import { type RowOf, useDrizzleQuery } from '@/shared/data/use-drizzle-query';

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

/** History entry: the team changed the status (optionally with a note) or the user reopened. */
export interface TicketEvent {
  id: string;
  kind: 'status' | 'reopened';
  /** New status; 'open' for reopen events. */
  status: TicketStatus;
  /** App version the change ships in, e.g. "1.4.3"; shown as a localized line. */
  version: string | null;
  /** Custom team text, shown as written (not translated). */
  note: string | null;
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

const lastMessage = alias(ticketMessages, 'last_message');

/** Messages of the ticket in the outer query, for correlated subqueries. */
const messagesOfTicket = eq(ticketMessages.ticket_id, tickets.id);

/** Every ticket with its latest message, latest team reply and all message bodies. */
const ticketListQuery = () =>
  drizzle
    .select({
      ...getTableColumns(tickets),
      last_author: lastMessage.author,
      last_body: lastMessage.body,
      last_attachments: lastMessage.attachments,
      last_at: lastMessage.created_at,
      last_team_at: sql<string | null>`${drizzle
        .select({ at: max(ticketMessages.created_at) })
        .from(ticketMessages)
        .where(and(messagesOfTicket, eq(ticketMessages.author, 'team')))}`,
      bodies: sql<string | null>`${drizzle
        .select({ bodies: sql`group_concat(${ticketMessages.body}, ' ')` })
        .from(ticketMessages)
        .where(messagesOfTicket)}`,
    })
    .from(tickets)
    .leftJoin(
      lastMessage,
      eq(
        lastMessage.id,
        drizzle
          .select({ id: ticketMessages.id })
          .from(ticketMessages)
          .where(messagesOfTicket)
          .orderBy(desc(ticketMessages.created_at), desc(ticketMessages.id))
          .limit(1),
      ),
    )
    .orderBy(desc(sql`coalesce(${lastMessage.created_at}, ${tickets.updated_at})`));

const toTicket = (r: TicketRecord): Ticket => ({
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

const toSummaries = (rows: RowOf<typeof ticketListQuery>[]): TicketSummary[] =>
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

const toTicketOrNull = (rows: TicketRecord[]) => (rows[0] ? toTicket(rows[0]) : null);

const toMessages = (rows: TicketMessageRecord[]): TicketMessage[] =>
  rows.map((r) => ({
    id: r.id,
    ticketId: r.ticket_id ?? '',
    author: r.author === 'team' ? 'team' : 'user',
    body: r.body ?? '',
    attachments: parseJson<string[]>(r.attachments, []),
    createdAt: r.created_at ?? '',
  }));

const toEvents = (rows: TicketEventRecord[]): TicketEvent[] =>
  rows.map((r) => ({
    id: r.id,
    kind: r.kind === 'reopened' ? 'reopened' : 'status',
    status: r.kind === 'reopened' ? 'open' : ((r.status as TicketStatus | null) ?? 'open'),
    version: r.version,
    note: r.note,
    createdAt: r.created_at,
  }));

/** All of the user's tickets with their latest message, most recent activity first. */
export function useTickets() {
  return useDrizzleQuery({
    queryKey: supportKeys.tickets.queryKey,
    query: ticketListQuery(),
    map: toSummaries,
  });
}

export function useTicket(ticketId: string) {
  return useDrizzleQuery({
    queryKey: supportKeys.ticket(ticketId).queryKey,
    query: drizzle.select().from(tickets).where(eq(tickets.id, ticketId)),
    map: toTicketOrNull,
  });
}

/** The chat of one ticket, oldest first. Team replies arrive through sync. */
export function useTicketMessages(ticketId: string) {
  return useDrizzleQuery({
    queryKey: supportKeys.messages(ticketId).queryKey,
    query: drizzle
      .select()
      .from(ticketMessages)
      .where(eq(ticketMessages.ticket_id, ticketId))
      .orderBy(ticketMessages.created_at, ticketMessages.id),
    map: toMessages,
  });
}

/** Status history of one ticket, oldest first. Team events arrive through sync. */
export function useTicketEvents(ticketId: string) {
  return useDrizzleQuery({
    queryKey: supportKeys.events(ticketId).queryKey,
    query: drizzle
      .select()
      .from(ticketEvents)
      .where(eq(ticketEvents.ticket_id, ticketId))
      .orderBy(ticketEvents.created_at, ticketEvents.id),
    map: toEvents,
  });
}
