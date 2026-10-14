import { parseJson } from '@/shared/data/json';
import { drizzle } from '@/shared/data/powersync/database';
import {
  progressCheckPhotos,
  progressChecks,
  type ProgressCheckRecord,
} from '@/shared/data/powersync/schema';
import { queryKeys } from '@/shared/data/query-keys';
import { type RowOf, useDrizzleQuery } from '@/shared/data/use-drizzle-query';

import type { ProgressCheckMetrics, GroupScores } from '../lib/progress-check-service';
import type { Pose } from '../lib/poses';
import { progressCheckPhotoKeys } from './progress-check-keys';

export interface ProgressCheck {
  id: string;
  score: number;
  groupScores: Partial<GroupScores>;
  metrics: Partial<ProgressCheckMetrics>;
  createdAt: string;
}

/** Storage path of each pose's photo in the bucket (uploaded for the assessment, before saving). */
export type CheckPhotos = Partial<Record<Pose, string>>;

const toChecks = (rows: ProgressCheckRecord[]): ProgressCheck[] =>
  rows.map((r) => ({
    id: r.id,
    score: r.score,
    groupScores: parseJson(r.group_scores, {}),
    metrics: parseJson(r.metrics, {}),
    createdAt: r.created_at,
  }));

/** All progress checks, oldest first (check numbers follow this order). */
export function useProgressChecks() {
  return useDrizzleQuery({
    queryKey: queryKeys.progressChecks.list.queryKey,
    query: drizzle.select().from(progressChecks).orderBy(progressChecks.created_at),
    map: toChecks,
  });
}

const photoListQuery = () =>
  drizzle
    .select({
      check_id: progressCheckPhotos.check_id,
      pose: progressCheckPhotos.pose,
      storage_path: progressCheckPhotos.storage_path,
    })
    .from(progressCheckPhotos);

function byCheck(rows: RowOf<typeof photoListQuery>[]) {
  const out: Record<string, CheckPhotos> = {};
  for (const r of rows) {
    out[r.check_id] ??= {};
    out[r.check_id][r.pose as Pose] = r.storage_path;
  }
  return out;
}

/** Storage paths of every check's photos, by check id and pose. */
export function useProgressCheckPhotos() {
  return useDrizzleQuery({
    queryKey: progressCheckPhotoKeys.list.queryKey,
    query: photoListQuery(),
    map: byCheck,
  });
}
