import { parseJson } from '@/shared/data/json';
import type { BodyCheckRecord } from '@/shared/data/powersync/schema';
import { queryKeys } from '@/shared/data/query-keys';
import { useSqlQuery } from '@/shared/data/use-sql-query';

import type { BodyCheckMetrics, GroupScores } from '../lib/body-check-service';
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

const toChecks = (rows: (BodyCheckRecord & { id: string })[]): BodyCheck[] =>
  rows.map((r) => ({
    id: r.id,
    score: r.score ?? 0,
    groupScores: parseJson(r.group_scores, {}),
    metrics: parseJson(r.metrics, {}),
    createdAt: r.created_at ?? '',
  }));

/** All body checks, oldest first (check numbers follow this order). */
export function useBodyChecks() {
  return useSqlQuery({
    queryKey: queryKeys.bodyChecks.list.queryKey,
    sql: 'SELECT * FROM body_checks ORDER BY created_at',
    map: toChecks,
  });
}

interface PhotoRow {
  id: string;
  body_check_id: string;
  pose: BodyPose;
  storage_path: string | null;
}

function byCheck(rows: PhotoRow[]) {
  const out: Record<string, CheckPhotos> = {};
  for (const r of rows) {
    out[r.body_check_id] ??= {};
    out[r.body_check_id][r.pose] = {
      id: r.id,
      checkId: r.body_check_id,
      pose: r.pose,
      storagePath: r.storage_path,
    };
  }
  return out;
}

/** Photos of every check, grouped by check id and pose. */
export function useBodyCheckPhotos() {
  return useSqlQuery({
    queryKey: bodyCheckPhotoKeys.list.queryKey,
    sql: 'SELECT id, body_check_id, pose, storage_path FROM body_check_photos',
    map: byCheck,
  });
}

const firstCount = (rows: { n: number }[]) => rows[0]?.n ?? 0;

/** Number of the user's photos that still wait for their upload. */
export function usePendingPhotoCount(userId: string | null) {
  return useSqlQuery({
    queryKey: bodyCheckPhotoKeys.pendingCount(userId ?? '').queryKey,
    sql: 'SELECT COUNT(*) AS n FROM body_check_photos WHERE storage_path IS NULL AND user_id = ?',
    parameters: [userId],
    enabled: !!userId,
    map: firstCount,
  });
}
