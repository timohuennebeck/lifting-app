import { eq } from 'drizzle-orm';

import { newId, nowIso } from '@/shared/data/json';
import { drizzle, type Executor } from '@/shared/data/powersync/database';
import { ticketMessages, tickets } from '@/shared/data/powersync/schema';

import { firstLine } from '../lib/ticket-format';
import type { TicketKind } from './tickets';

export interface NewMessage {
  userId: string;
  ticketId: string;
  body: string;
  /** Storage paths of screenshots that are already uploaded. */
  attachments: string[];
}

export interface NewTicket extends NewMessage {
  kind: TicketKind;
  /** Importance 1–5 of a feature request; null for bugs. */
  priority: number | null;
}

async function insertMessage(executor: Executor, message: NewMessage, createdAt: string) {
  await executor.insert(ticketMessages).values({
    id: newId(),
    user_id: message.userId,
    ticket_id: message.ticketId,
    author: 'user',
    body: message.body.trim(),
    attachments: JSON.stringify(message.attachments),
    created_at: createdAt,
  });
}

/**
 * Creates the ticket and its first message in one local transaction; PowerSync uploads both.
 * The number is left out on purpose: the server assigns it and syncs it back.
 */
export async function createTicket(input: NewTicket) {
  const now = nowIso();
  await drizzle.transaction(async (tx) => {
    await tx.insert(tickets).values({
      id: input.ticketId,
      user_id: input.userId,
      kind: input.kind,
      status: 'open',
      priority: input.priority,
      subject: firstLine(input.body),
      created_at: now,
      updated_at: now,
    });
    await insertMessage(tx, input, now);
  });
}

/** A follow-up message from the user in an existing ticket's chat. */
export function sendTicketMessage(message: NewMessage) {
  return insertMessage(drizzle, message, nowIso());
}

/** Puts a resolved or closed ticket back into the team's queue. */
export async function reopenTicket(ticketId: string) {
  await drizzle
    .update(tickets)
    .set({ status: 'open', closed_at: null, updated_at: nowIso() })
    .where(eq(tickets.id, ticketId));
}
