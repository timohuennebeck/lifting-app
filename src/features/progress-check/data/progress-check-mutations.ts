import { eq } from 'drizzle-orm';

import { newId, nowIso } from '@/shared/data/json';
import { drizzle } from '@/shared/data/powersync/database';
import { progressCheckPhotos, progressChecks } from '@/shared/data/powersync/schema';

import { type ProgressCheckResult, removeUploadedPhotos } from '../lib/progress-check-service';
import {
  deleteCheckFiles,
  deleteDrafts,
  finalizePhotos,
  type StoredPhoto,
  storagePathOf,
} from '../lib/photo-files';
import { POSES, type Pose } from '../lib/poses';

export interface SaveProgressCheckInput {
  checkId: string;
  userId: string;
  result: ProgressCheckResult;
  photos: Record<Pose, StoredPhoto>;
}

/**
 * Saves an assessed check: the photos move to their final files on this device, then the check
 * and its photo rows are inserted in one transaction. The assessment already uploaded the photos,
 * and the server takes the values from the assessment, not from here. PowerSync syncs the rows.
 */
export async function saveProgressCheck({
  checkId,
  userId,
  result,
  photos,
}: SaveProgressCheckInput) {
  const rollback = finalizePhotos(checkId, photos);
  const createdAt = nowIso();
  try {
    await drizzle.transaction(async (tx) => {
      await tx.insert(progressChecks).values({
        id: checkId,
        user_id: userId,
        score: result.score,
        group_scores: JSON.stringify(result.groupScores),
        metrics: JSON.stringify(result.metrics),
        created_at: createdAt,
      });
      for (const pose of POSES) {
        await tx.insert(progressCheckPhotos).values({
          id: newId(),
          user_id: userId,
          check_id: checkId,
          pose,
          storage_path: storagePathOf(userId, checkId, pose),
          created_at: createdAt,
        });
      }
    });
  } catch (error) {
    rollback();
    throw error;
  }
  deleteDrafts(checkId);
}

/**
 * Deletes a check with its photos: the rows (synced; local tables have no cascades), the files
 * on this device and, best effort, in storage (offline they stay there).
 */
export async function deleteProgressCheck(checkId: string, userId: string) {
  await drizzle.transaction(async (tx) => {
    await tx.delete(progressCheckPhotos).where(eq(progressCheckPhotos.check_id, checkId));
    await tx.delete(progressChecks).where(eq(progressChecks.id, checkId));
  });
  deleteCheckFiles(checkId);
  removeUploadedPhotos(checkId, userId);
}
