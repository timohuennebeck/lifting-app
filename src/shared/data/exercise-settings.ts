import { eq } from 'drizzle-orm';
import { CryptoDigestAlgorithm, digestStringAsync } from 'expo-crypto';

import { nowIso } from './json';
import { drizzle } from './powersync/database';
import { exerciseSettings, type ExerciseSettingRecord } from './powersync/schema';
import { queryKeys } from './query-keys';
import { useDrizzleQuery } from './use-drizzle-query';

/** How the user loads an exercise's bar, as last set in the plates sheet. */
export interface ExerciseSetting {
  /** The bar's (or sled's) weight; kept while `noBar` is on. */
  barKg: number;
  /** The plates go on without a bar. */
  noBar: boolean;
}

/**
 * The id of a user's row for an exercise, the same as the server's
 * `private.exercise_setting_id`: the first 32 hex digits of SHA-256("<user id>:<exercise id>").
 * Two devices saving the same exercise write one row instead of colliding.
 */
async function exerciseSettingId(userId: string, exerciseId: string) {
  const hex = await digestStringAsync(CryptoDigestAlgorithm.SHA256, `${userId}:${exerciseId}`);
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

const toSetting = (rows: ExerciseSettingRecord[]): ExerciseSetting | null => {
  const row = rows[0];
  return row ? { barKg: row.bar_kg, noBar: row.no_bar } : null;
};

/** The user's setting for an exercise; null until they change it (and while it loads). */
export function useExerciseSetting(exerciseId: string) {
  const { data } = useDrizzleQuery({
    queryKey: queryKeys.exerciseSettings.detail(exerciseId).queryKey,
    query: drizzle
      .select()
      .from(exerciseSettings)
      .where(eq(exerciseSettings.exercise_id, exerciseId))
      .limit(1),
    enabled: !!exerciseId,
    map: toSetting,
  });
  return data ?? null;
}

/**
 * Saves how an exercise's bar is loaded, replacing the earlier setting (PowerSync views have no
 * UPSERT; the upload is one). Kept to two decimals like the server column.
 */
export async function saveExerciseSetting(
  userId: string,
  exerciseId: string,
  setting: ExerciseSetting,
) {
  const id = await exerciseSettingId(userId, exerciseId);
  const values = {
    bar_kg: Math.round(setting.barKg * 100) / 100,
    no_bar: setting.noBar,
    updated_at: nowIso(),
  };
  const existing = await drizzle
    .select({ id: exerciseSettings.id })
    .from(exerciseSettings)
    .where(eq(exerciseSettings.id, id))
    .get();
  if (existing) {
    await drizzle.update(exerciseSettings).set(values).where(eq(exerciseSettings.id, id));
    return;
  }
  await drizzle
    .insert(exerciseSettings)
    .values({ id, user_id: userId, exercise_id: exerciseId, ...values });
}
