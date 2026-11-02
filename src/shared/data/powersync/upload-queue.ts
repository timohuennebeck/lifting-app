import { wait } from '@/shared/lib/async';

import { db } from './database';

/**
 * Waits (bounded) until PowerSync's upload queue holds no change, or none to `table`, for an Edge
 * Function that reads the user's data on the server. False when one is still waiting.
 */
export async function uploadsDone(timeoutMs: number, table?: string) {
  const deadline = Date.now() + timeoutMs;
  const query = table
    ? "SELECT 1 FROM ps_crud WHERE json_extract(data, '$.type') = ? LIMIT 1"
    : 'SELECT 1 FROM ps_crud LIMIT 1';
  try {
    while (await db.getOptional(query, table ? [table] : [])) {
      if (Date.now() >= deadline) return false;
      await wait(500);
    }
  } catch (error) {
    console.warn('Reading the upload queue failed', error);
  }
  return true;
}
