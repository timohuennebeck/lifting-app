import { and, eq, isNull } from 'drizzle-orm';

import { drizzle } from '@/shared/data/powersync/database';
import { bodyCheckPhotos } from '@/shared/data/powersync/schema';
import { supabase } from '@/shared/data/supabase';
import { useBackgroundDrain } from '@/shared/hooks/use-background-drain';
import { useUserId } from '@/shared/stores/session-store';

import { setPhotoStoragePath } from '../data/body-check-mutations';
import { usePendingPhotoCount } from '../data/body-checks';
import { PHOTO_BUCKET, photoFile, storagePathOf } from '../lib/photo-files';
import type { BodyPose } from '../lib/poses';

interface PendingRow {
  id: string;
  body_check_id: string;
  pose: BodyPose;
}

// One drain at a time app-wide, even if the hook is mounted in several places.
let draining: Promise<boolean> | null = null;

/** Uploads every pending photo that exists on this device; false if one failed. */
function drainQueue(userId: string) {
  draining ??= (async () => {
    const rows = (await drizzle
      .select({
        id: bodyCheckPhotos.id,
        body_check_id: bodyCheckPhotos.body_check_id,
        pose: bodyCheckPhotos.pose,
      })
      .from(bodyCheckPhotos)
      .where(
        and(isNull(bodyCheckPhotos.storage_path), eq(bodyCheckPhotos.user_id, userId)),
      )) as PendingRow[];
    for (const row of rows) {
      const file = photoFile(row.body_check_id, row.pose);
      // Taken on another device that has not uploaded it yet.
      if (!file.exists) continue;
      const path = storagePathOf(userId, row.body_check_id, row.pose);
      try {
        const { error } = await supabase.storage
          .from(PHOTO_BUCKET)
          .upload(path, await file.arrayBuffer(), { contentType: 'image/jpeg', upsert: true });
        if (error) throw error;
        await setPhotoStoragePath(row.id, path);
      } catch (error) {
        console.warn('Body-check photo upload failed; retrying later', error);
        return false;
      }
    }
    return true;
  })().finally(() => {
    draining = null;
  });
  return draining;
}

/**
 * Background upload of body-check photos to Supabase Storage while signed in; see
 * useBackgroundDrain for when it runs and retries. Mounted once in the (app) layout.
 */
export function usePhotoUploadQueue() {
  const userId = useUserId();
  const { data: pending = 0 } = usePendingPhotoCount(userId);
  useBackgroundDrain(userId ? pending : 0, () => drainQueue(userId!), 'Body-check upload');
}
