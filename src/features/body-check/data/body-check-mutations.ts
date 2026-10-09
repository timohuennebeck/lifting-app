import { newId, nowIso } from '@/shared/data/json';
import { db } from '@/shared/data/powersync/database';

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
    await db.writeTransaction(async (tx) => {
      await tx.execute(
        `INSERT INTO body_checks (id, user_id, score, group_scores, metrics, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          checkId,
          userId,
          result.score,
          JSON.stringify(result.groupScores),
          JSON.stringify(result.metrics),
          createdAt,
        ],
      );
      for (const pose of POSES) {
        await tx.execute(
          `INSERT INTO body_check_photos (id, user_id, body_check_id, pose, storage_path, created_at)
           VALUES (?, ?, ?, ?, NULL, ?)`,
          [newId(), userId, checkId, pose, createdAt],
        );
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
  await db.execute('UPDATE body_check_photos SET storage_path = ? WHERE id = ?', [
    storagePath,
    photoId,
  ]);
}
