import { eq } from 'drizzle-orm';

import { newId, nowIso } from '@/shared/data/json';
import { drizzle } from '@/shared/data/powersync/database';
import { bodyCheckPhotos, bodyChecks } from '@/shared/data/powersync/schema';

import type { BodyCheckResult } from '../lib/body-check-service';
import { deleteDrafts, finalizePhotos, type StoredPhoto } from '../lib/photo-files';
import { POSES, type BodyPose } from '../lib/poses';

export interface SaveBodyCheckInput {
  checkId: string;
  userId: string;
  result: BodyCheckResult;
  photos: Record<BodyPose, StoredPhoto>;
}

/**
 * Saves a check local-first: photos move to their final files, then the check and
 * its photo rows are inserted in one transaction (storage_path stays null until
 * the upload queue has uploaded the file). PowerSync syncs the rows.
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
          storage_path: null,
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
