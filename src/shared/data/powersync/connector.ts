import {
  type AbstractPowerSyncDatabase,
  type PowerSyncBackendConnector,
  UpdateType,
} from '@powersync/react-native';

import { env } from '@/shared/config/env';
import { supabase } from '@/shared/data/supabase';

// Postgres errors that will never succeed on retry; drop them so the queue keeps moving.
const FATAL_RESPONSE_CODES = [/^22...$/, /^23...$/, /^42501$/];

// jsonb columns are stored locally as JSON text. Upload them as JSON values, otherwise
// Postgres stores a jsonb *string* that syncs back double-encoded.
const JSON_COLUMNS: Record<string, readonly string[]> = {
  profiles: ['complaints', 'focus', 'training_days'],
  body_checks: ['group_scores'],
};

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
      for (const op of transaction.crud) {
        const table = supabase.from(op.table);
        const result =
          op.op === UpdateType.PUT
            ? await table.upsert({ ...toRemote(op.table, op.opData), id: op.id })
            : op.op === UpdateType.PATCH
              ? await table.update(toRemote(op.table, op.opData)).eq('id', op.id)
              : await table.delete().eq('id', op.id);
        if (result.error) throw result.error;
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
