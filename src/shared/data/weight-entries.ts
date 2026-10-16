import { asc, eq } from 'drizzle-orm';
import { CryptoDigestAlgorithm, digestStringAsync } from 'expo-crypto';

import { nowIso } from './json';
import { drizzle, type Executor } from './powersync/database';
import { weightEntries, type WeightEntryRecord } from './powersync/schema';
import { queryKeys } from './query-keys';
import { useDrizzleQuery } from './use-drizzle-query';

export interface WeightEntry {
  id: string;
  /** The user's calendar day (YYYY-MM-DD). */
  date: string;
  weightKg: number;
}

/**
 * The id of a user's entry on a date, the same as the server's `private.weight_entry_id`: the
 * first 32 hex digits of SHA-256("<user id>:<date>"). Two devices saving the same day write
 * one row instead of colliding.
 */
async function weightEntryId(userId: string, date: string) {
  const hex = await digestStringAsync(CryptoDigestAlgorithm.SHA256, `${userId}:${date}`);
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ]
    .join('-')
    .toLowerCase();
}

const toEntry = (r: WeightEntryRecord): WeightEntry => ({
  id: r.id,
  date: r.date,
  weightKg: r.weight_kg,
});
const toEntries = (rows: WeightEntryRecord[]) => rows.map(toEntry);

/** The signed-in user's entries, oldest first. */
export function useWeightEntries() {
  const { data, isLoading } = useDrizzleQuery({
    queryKey: queryKeys.weight.entries.queryKey,
    query: drizzle.select().from(weightEntries).orderBy(asc(weightEntries.date)),
    map: toEntries,
  });
  return { entries: data ?? [], isLoading };
}

/**
 * Saves the weight of a day, replacing that day's entry (PowerSync views have no UPSERT; the
 * upload is one). Kept to two decimals like the server column.
 */
export async function saveWeightEntry(
  userId: string,
  date: string,
  weightKg: number,
  executor: Executor = drizzle,
) {
  const id = await weightEntryId(userId, date);
  const weight_kg = Math.round(weightKg * 100) / 100;
  const existing = await executor
    .select({ id: weightEntries.id })
    .from(weightEntries)
    .where(eq(weightEntries.id, id))
    .get();
  if (existing) {
    await executor.update(weightEntries).set({ weight_kg }).where(eq(weightEntries.id, id));
    return;
  }
  await executor
    .insert(weightEntries)
    .values({ id, user_id: userId, date, weight_kg, created_at: nowIso() });
}

export async function deleteWeightEntry(id: string, executor: Executor = drizzle) {
  await executor.delete(weightEntries).where(eq(weightEntries.id, id));
}

/**
 * Saves a day's weight, and when it was moved there from another day, removes that day's entry
 * in the same step. An entry already on the new day is replaced.
 */
export async function saveWeightEntryMoved(
  userId: string,
  date: string,
  weightKg: number,
  movedFrom: WeightEntry | null,
) {
  await drizzle.transaction(async (tx) => {
    if (movedFrom && movedFrom.date !== date) await deleteWeightEntry(movedFrom.id, tx);
    await saveWeightEntry(userId, date, weightKg, tx);
  });
}
