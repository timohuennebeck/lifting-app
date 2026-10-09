import { newId, nowIso } from '@/shared/data/json';
import { db, type Tx } from '@/shared/data/powersync/database';

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

function insertMessage(executor: Pick<Tx, 'execute'>, message: NewMessage, createdAt: string) {
  return executor.execute(
    `INSERT INTO ticket_messages (id, user_id, ticket_id, author, body, attachments, created_at)
     VALUES (?, ?, ?, 'user', ?, ?, ?)`,
    [
      newId(),
      message.userId,
      message.ticketId,
      message.body.trim(),
      JSON.stringify(message.attachments),
      createdAt,
    ],
  );
}

/**
 * Creates the ticket and its first message in one local transaction; PowerSync uploads both.
 * The number is left out on purpose: the server assigns it and syncs it back.
 */
export async function createTicket(input: NewTicket) {
  const now = nowIso();
  await db.writeTransaction(async (tx) => {
    await tx.execute(
      `INSERT INTO tickets (id, user_id, kind, status, priority, subject, created_at, updated_at)
       VALUES (?, ?, ?, 'open', ?, ?, ?, ?)`,
      [input.ticketId, input.userId, input.kind, input.priority, firstLine(input.body), now, now],
    );
    await insertMessage(tx, input, now);
  });
}

/** A follow-up message from the user in an existing ticket's chat. */
export function sendTicketMessage(message: NewMessage) {
  return insertMessage(db, message, nowIso());
}

/** Puts a resolved or closed ticket back into the team's queue. */
export function reopenTicket(ticketId: string) {
  return db.execute(
    `UPDATE tickets SET status = 'open', closed_at = NULL, updated_at = ? WHERE id = ?`,
    [nowIso(), ticketId],
  );
}
