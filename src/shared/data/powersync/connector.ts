import {
  type AbstractPowerSyncDatabase,
  type CrudEntry,
  type PowerSyncBackendConnector,
  UpdateType,
} from '@powersync/react-native';

import { env } from '@/shared/config/env';
import { supabase } from '@/shared/data/supabase';

// Errors that will never succeed on retry; drop them so the queue keeps moving: Postgres data,
// constraint and permission errors, a trigger's plain `raise` (P0001), and PostgREST's unknown
// column (PGRST204) or table (PGRST205), e.g. a change queued before a migration renamed it.
const FATAL_RESPONSE_CODES = [/^22...$/, /^23...$/, /^42501$/, /^P0001$/, /^PGRST20[45]$/];

// jsonb columns are stored locally as JSON text. Upload them as JSON values, otherwise
// Postgres stores a jsonb *string* that syncs back double-encoded.
const JSON_COLUMNS: Record<string, readonly string[]> = {
  profiles: ['focus', 'home_equipment', 'plates_kg', 'plates_lb'],
  progress_checks: ['group_scores', 'metrics'],
  ticket_messages: ['attachments'],
  custom_exercises: ['primary_muscles', 'secondary_muscles', 'measures'],
};

// Users may only insert into these tables. A retried insert that already went through must not
// become an update, which RLS rejects and would get the rest of the transaction discarded.
const APPEND_ONLY_TABLES = new Set(['ticket_messages', 'ticket_events', 'legal_acceptances']);

function toRemote(table: string, data: Record<string, unknown> | undefined) {
  const columns = JSON_COLUMNS[table];
  if (!data || !columns) return data ?? {};
  const out = { ...data };
  for (const column of columns) {
    const value = out[column];
    if (typeof value !== 'string') continue;
    try {
      out[column] = JSON.parse(value);
    } catch {
      // Leave malformed text as-is; Postgres rejects it and the op is discarded.
    }
  }
  return out;
}

/** Rows per request: inserts go in the body, deletes' ids in the URL. */
const PUT_BATCH = 500;
const DELETE_BATCH = 100;

/** Changes sent in one request: consecutive inserts or deletes of one table. */
interface Batch {
  table: string;
  op: UpdateType;
  /** An insert's columns: a bulk upsert sends the same ones for every row. */
  columns: string;
  ops: CrudEntry[];
}

/**
 * The transaction's changes as requests, in their order: consecutive inserts (with the same
 * columns) or deletes of a table go together, updates one by one. Only consecutive ones join, so
 * a parent is still saved before its children.
 */
function batches(crud: CrudEntry[]) {
  const out: Batch[] = [];
  for (const op of crud) {
    const columns =
      op.op === UpdateType.PUT
        ? Object.keys(op.opData ?? {})
            .sort()
            .join()
        : '';
    const last = out.at(-1);
    const max = op.op === UpdateType.DELETE ? DELETE_BATCH : PUT_BATCH;
    const joins =
      op.op !== UpdateType.PATCH &&
      last?.table === op.table &&
      last.op === op.op &&
      last.columns === columns &&
      last.ops.length < max;
    if (joins) last.ops.push(op);
    else out.push({ table: op.table, op: op.op, columns, ops: [op] });
  }
  return out;
}

/** Sends one batch: a bulk upsert, one update, or one delete of several ids. */
function send({ table, op, ops }: Batch) {
  const rows = supabase.from(table);
  if (op === UpdateType.PUT) {
    return rows.upsert(
      ops.map((o) => ({ ...toRemote(table, o.opData), id: o.id })),
      { onConflict: 'id', ignoreDuplicates: APPEND_ONLY_TABLES.has(table) },
    );
  }
  if (op === UpdateType.PATCH)
    return rows.update(toRemote(table, ops[0].opData)).eq('id', ops[0].id);
  return rows.delete().in(
    'id',
    ops.map((o) => o.id),
  );
}

export class SupabaseConnector implements PowerSyncBackendConnector {
  async fetchCredentials() {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) return null;
    return { endpoint: env.powerSyncUrl, token: data.session.access_token };
  }

  async uploadData(database: AbstractPowerSyncDatabase) {
    const transaction = await database.getNextCrudTransaction();
    if (!transaction) return;

    try {
      // One request per batch instead of per row: starting a workout or saving a plan is a few
      // requests, not dozens one after another.
      for (const batch of batches(transaction.crud)) {
        const { error } = await send(batch);
        if (error) throw error;
      }
      await transaction.complete();
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code && FATAL_RESPONSE_CODES.some((pattern) => pattern.test(code))) {
        console.error('Discarding unrecoverable upload', error);
        await transaction.complete();
        return;
      }
      throw error;
    }
  }
}
