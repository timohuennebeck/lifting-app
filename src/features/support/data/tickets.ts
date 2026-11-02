import { and, desc, eq, getTableColumns, max, sql } from 'drizzle-orm';
import { alias, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';

import { parseJson } from '@/shared/data/json';
import { drizzle } from '@/shared/data/powersync/database';
import {
  ticketEvents,
  type TicketEventRecord,
  ticketMessages,
  ticketMessageTranslations,
  tickets,
  type TicketRecord,
} from '@/shared/data/powersync/schema';
import { type RowOf, useDrizzleQuery } from '@/shared/data/use-drizzle-query';
import { useAppLanguage } from '@/shared/hooks/use-app-language';

import { supportKeys } from './support-keys';

export type TicketKind = 'bug' | 'idea';
export type TicketStatus = 'open' | 'closed';
type MessageAuthor = 'user' | 'team';

/** Open tickets still await the team; closed ones are done. */
export const isTicketActive = (status: TicketStatus) => status === 'open';

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
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  author: MessageAuthor;
  content: string;
  /** Storage paths in the ticket-attachments bucket. */
  attachments: string[];
  /** The text in the app language when it was written in another one (team replies). */
  translation: string | null;
  createdAt: string;
}

/** History entry: the team opened or closed the ticket (optionally with a note) or the user reopened. */
export interface TicketEvent {
  id: string;
  kind: 'status' | 'reopened';
  /** New status; 'open' for reopen events. */
  status: TicketStatus;
  /** Custom team text, shown as written (not translated). */
  note: string | null;
  createdAt: string;
}

export interface TicketSummary extends Ticket {
  lastMessage: Pick<TicketMessage, 'author' | 'content' | 'attachments' | 'translation'> | null;
  lastTeamAt: string | null;
  /** Latest message time (or the ticket's update), for sorting and the row date. */
  activityAt: string;
}

const lastMessage = alias(ticketMessages, 'last_message');

/** Messages of the ticket in the outer query, for correlated subqueries. */
const messagesOfTicket = eq(ticketMessages.ticket_id, tickets.id);

/** A message's translation into `language`, for the query around it. */
const translationOf = (messageId: AnySQLiteColumn, language: string) =>
  sql<string | null>`${drizzle
    .select({ content: ticketMessageTranslations.content })
    .from(ticketMessageTranslations)
    .where(
      and(
        eq(ticketMessageTranslations.message_id, messageId),
        eq(ticketMessageTranslations.language, language),
      ),
    )
    .limit(1)}`;

/** Every ticket with its latest message (and its translation) and latest team reply. */
const ticketListQuery = (language: string) =>
  drizzle
    .select({
      ...getTableColumns(tickets),
      last_author: lastMessage.author,
      last_content: lastMessage.content,
      last_attachments: lastMessage.attachments,
      last_translation: translationOf(lastMessage.id, language),
      last_at: lastMessage.created_at,
      last_team_at: sql<string | null>`${drizzle
        .select({ at: max(ticketMessages.created_at) })
        .from(ticketMessages)
        .where(and(messagesOfTicket, eq(ticketMessages.author, 'team')))}`,
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
  status: r.status as TicketStatus,
  priority: r.priority,
  subject: r.subject,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const toSummaries = (rows: RowOf<typeof ticketListQuery>[]): TicketSummary[] =>
  rows.map((r) => {
    const ticket = toTicket(r);
    return {
      ...ticket,
      lastMessage: r.last_at
        ? {
            author: r.last_author === 'team' ? 'team' : 'user',
            content: r.last_content ?? '',
            attachments: parseJson<string[]>(r.last_attachments, []),
            translation: r.last_translation,
          }
        : null,
      lastTeamAt: r.last_team_at,
      activityAt: r.last_at ?? ticket.updatedAt,
    };
  });

const toTicketOrNull = (rows: TicketRecord[]) => (rows[0] ? toTicket(rows[0]) : null);

/** A ticket's chat, oldest first, each message with its translation into `language`. */
const messagesQuery = (ticketId: string, language: string) =>
  drizzle
    .select({
      ...getTableColumns(ticketMessages),
      translation: translationOf(ticketMessages.id, language),
    })
    .from(ticketMessages)
    .where(eq(ticketMessages.ticket_id, ticketId))
    .orderBy(ticketMessages.created_at, ticketMessages.id);

const toMessages = (rows: RowOf<typeof messagesQuery>[]): TicketMessage[] =>
  rows.map((r) => ({
    id: r.id,
    ticketId: r.ticket_id,
    author: r.author === 'team' ? 'team' : 'user',
    content: r.content,
    attachments: parseJson<string[]>(r.attachments, []),
    translation: r.translation,
    createdAt: r.created_at,
  }));

const toEvents = (rows: TicketEventRecord[]): TicketEvent[] =>
  rows.map((r) => ({
    id: r.id,
    kind: r.kind === 'reopened' ? 'reopened' : 'status',
    status: r.kind === 'reopened' || r.status !== 'closed' ? 'open' : 'closed',
    note: r.note,
    createdAt: r.created_at,
  }));

/** All of the user's tickets with their latest message, most recent activity first. */
export function useTickets() {
  const language = useAppLanguage();
  return useDrizzleQuery({
    queryKey: supportKeys.tickets(language).queryKey,
    query: ticketListQuery(language),
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

/**
 * The chat of one ticket, oldest first, in the app language where the server translated a
 * message. Team replies and translations arrive through sync.
 */
export function useTicketMessages(ticketId: string) {
  const language = useAppLanguage();
  return useDrizzleQuery({
    queryKey: supportKeys.messages(ticketId, language).queryKey,
    query: messagesQuery(ticketId, language),
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
