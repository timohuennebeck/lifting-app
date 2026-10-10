import { eq } from 'drizzle-orm';

import { newId, nowIso } from '@/shared/data/json';
import { drizzle } from '@/shared/data/powersync/database';
import { bodyCheckPhotos, bodyChecks } from '@/shared/data/powersync/schema';

import { type BodyCheckResult, removeUploadedPhotos } from '../lib/body-check-service';
import {
  deleteCheckFiles,
  deleteDrafts,
  finalizePhotos,
  type StoredPhoto,
  storagePathOf,
} from '../lib/photo-files';
import { POSES, type BodyPose } from '../lib/poses';

export interface SaveBodyCheckInput {
  checkId: string;
  userId: string;
  result: BodyCheckResult;
  photos: Record<BodyPose, StoredPhoto>;
}

/**
 * Saves an analysed check: the photos move to their final files on this device, then the check
 * and its photo rows are inserted in one transaction. The analysis already uploaded the photos,
 * and the server takes the values from the analysis, not from here. PowerSync syncs the rows.
 */
export async function saveBodyCheck({ checkId, userId, result, photos }: SaveBodyCheckInput) {
  const rollback = finalizePhotos(checkId, photos);
  const createdAt = nowIso();
  try {
    await drizzle.transaction(async (tx) => {
      await tx.insert(bodyChecks).values({
        id: checkId,
        user_id: userId,
        score: result.score,
        group_scores: JSON.stringify(result.groupScores),
        metrics: JSON.stringify(result.metrics),
        created_at: createdAt,
      });
      for (const pose of POSES) {
        await tx.insert(bodyCheckPhotos).values({
          id: newId(),
          user_id: userId,
          body_check_id: checkId,
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

/** Marks a photo as uploaded; PowerSync then syncs the path. */
export async function setPhotoStoragePath(photoId: string, storagePath: string) {
  await drizzle
    .update(bodyCheckPhotos)
    .set({ storage_path: storagePath })
    .where(eq(bodyCheckPhotos.id, photoId));
}

/**
 * Deletes a check with its photos: the rows (synced; local tables have no cascades), the files
 * on this device and, best effort, in storage (offline they stay there).
 */
export async function deleteBodyCheck(checkId: string, userId: string) {
  await drizzle.transaction(async (tx) => {
    await tx.delete(bodyCheckPhotos).where(eq(bodyCheckPhotos.body_check_id, checkId));
    await tx.delete(bodyChecks).where(eq(bodyChecks.id, checkId));
  });
  deleteCheckFiles(checkId);
  removeUploadedPhotos(checkId, userId);
}
