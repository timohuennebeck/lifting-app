import { and, count, eq, isNull } from 'drizzle-orm';

import { parseJson } from '@/shared/data/json';
import { drizzle } from '@/shared/data/powersync/database';
import { bodyCheckPhotos, bodyChecks, type BodyCheckRecord } from '@/shared/data/powersync/schema';
import { queryKeys } from '@/shared/data/query-keys';
import { type RowOf, useDrizzleQuery } from '@/shared/data/use-drizzle-query';

import type { BodyCheckMetrics, GroupScores } from '../lib/body-check-service';
import { photoFile } from '../lib/photo-files';
import type { BodyPose } from '../lib/poses';
import { bodyCheckPhotoKeys } from './body-check-keys';

export interface BodyCheck {
  id: string;
  score: number;
  groupScores: Partial<GroupScores>;
  metrics: Partial<BodyCheckMetrics>;
  createdAt: string;
}

export interface BodyCheckPhoto {
  id: string;
  checkId: string;
  pose: BodyPose;
  /** Path in the storage bucket; null until the upload finished. */
  storagePath: string | null;
}

export type CheckPhotos = Partial<Record<BodyPose, BodyCheckPhoto>>;

const toChecks = (rows: BodyCheckRecord[]): BodyCheck[] =>
  rows.map((r) => ({
    id: r.id,
    score: r.score ?? 0,
    groupScores: parseJson(r.group_scores, {}),
    metrics: parseJson(r.metrics, {}),
    createdAt: r.created_at ?? '',
  }));

/** All body checks, oldest first (check numbers follow this order). */
export function useBodyChecks() {
  return useDrizzleQuery({
    queryKey: queryKeys.bodyChecks.list.queryKey,
    query: drizzle.select().from(bodyChecks).orderBy(bodyChecks.created_at),
    map: toChecks,
  });
}

const photoListQuery = () =>
  drizzle
    .select({
      id: bodyCheckPhotos.id,
      body_check_id: bodyCheckPhotos.body_check_id,
      pose: bodyCheckPhotos.pose,
      storage_path: bodyCheckPhotos.storage_path,
    })
    .from(bodyCheckPhotos);

function byCheck(rows: RowOf<typeof photoListQuery>[]) {
  const out: Record<string, CheckPhotos> = {};
  for (const r of rows) {
    const pose = r.pose as BodyPose;
    out[r.body_check_id] ??= {};
    out[r.body_check_id][pose] = {
      id: r.id,
      checkId: r.body_check_id,
      pose,
      storagePath: r.storage_path,
    };
  }
  return out;
}

/** Photos of every check, grouped by check id and pose. */
export function useBodyCheckPhotos() {
  return useDrizzleQuery({
    queryKey: bodyCheckPhotoKeys.list.queryKey,
    query: photoListQuery(),
    map: byCheck,
  });
}

const firstCount = (rows: { n: number }[]) => rows[0]?.n ?? 0;

/** Number of the user's photos that still wait for their upload. */
export function usePendingPhotoCount(userId: string | null) {
  return useDrizzleQuery({
    queryKey: bodyCheckPhotoKeys.pendingCount(userId ?? '').queryKey,
    query: drizzle
      .select({ n: count() })
      .from(bodyCheckPhotos)
      .where(and(isNull(bodyCheckPhotos.storage_path), eq(bodyCheckPhotos.user_id, userId ?? ''))),
    enabled: !!userId,
    map: firstCount,
  });
}

interface PendingPhotoRow {
  id: string;
  body_check_id: string;
  pose: BodyPose;
}

/** The user's photos that wait for their upload and whose file is on this device. */
export async function localPendingPhotos(userId: string) {
  const rows = (await drizzle
    .select({
      id: bodyCheckPhotos.id,
      body_check_id: bodyCheckPhotos.body_check_id,
      pose: bodyCheckPhotos.pose,
    })
    .from(bodyCheckPhotos)
    .where(
      and(isNull(bodyCheckPhotos.storage_path), eq(bodyCheckPhotos.user_id, userId)),
    )) as PendingPhotoRow[];
  // Photos taken on another device that has not uploaded them yet are skipped.
  return rows.filter((row) => photoFile(row.body_check_id, row.pose).exists);
}

/** Number of photos only this device can still upload (lost on sign-out). */
export const countLocalPendingPhotos = async (userId: string) =>
  (await localPendingPhotos(userId)).length;
