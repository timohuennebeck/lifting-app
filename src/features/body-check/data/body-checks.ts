import { parseJson } from '@/shared/data/json';
import { drizzle } from '@/shared/data/powersync/database';
import { bodyCheckPhotos, bodyChecks, type BodyCheckRecord } from '@/shared/data/powersync/schema';
import { queryKeys } from '@/shared/data/query-keys';
import { type RowOf, useDrizzleQuery } from '@/shared/data/use-drizzle-query';

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

/** Storage path of each pose's photo in the bucket (the analysis uploads them before the save). */
export type CheckPhotos = Partial<Record<BodyPose, string>>;

const toChecks = (rows: BodyCheckRecord[]): BodyCheck[] =>
  rows.map((r) => ({
    id: r.id,
    score: r.score,
    groupScores: parseJson(r.group_scores, {}),
    metrics: parseJson(r.metrics, {}),
    createdAt: r.created_at,
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
      body_check_id: bodyCheckPhotos.body_check_id,
      pose: bodyCheckPhotos.pose,
      storage_path: bodyCheckPhotos.storage_path,
    })
    .from(bodyCheckPhotos);

function byCheck(rows: RowOf<typeof photoListQuery>[]) {
  const out: Record<string, CheckPhotos> = {};
  for (const r of rows) {
    out[r.body_check_id] ??= {};
    out[r.body_check_id][r.pose as BodyPose] = r.storage_path;
  }
  return out;
}

/** Storage paths of every check's photos, by check id and pose. */
export function useBodyCheckPhotos() {
  return useDrizzleQuery({
    queryKey: bodyCheckPhotoKeys.list.queryKey,
    query: photoListQuery(),
    map: byCheck,
  });
}
