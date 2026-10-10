import { uploadJpeg } from '@/shared/data/supabase-storage';
import { useBackgroundDrain } from '@/shared/hooks/use-background-drain';
import { useUserId } from '@/shared/stores/session-store';

import { setPhotoStoragePath } from '../data/body-check-mutations';
import { localPendingPhotos, usePendingPhotoCount } from '../data/body-checks';
import { PHOTO_BUCKET, photoFile, storagePathOf } from '../lib/photo-files';

/** Uploads every pending photo that exists on this device; false if one failed. */
async function uploadPendingPhotos(userId: string) {
  for (const row of await localPendingPhotos(userId)) {
    const path = storagePathOf(userId, row.body_check_id, row.pose);
    try {
      await uploadJpeg(PHOTO_BUCKET, path, photoFile(row.body_check_id, row.pose));
      await setPhotoStoragePath(row.id, path);
    } catch (error) {
      console.warn('Body-check photo upload failed; retrying later', error);
      return false;
    }
  }
  return true;
}

/**
 * Background upload to Supabase Storage of body-check photos saved without one: older checks,
 * from before the analysis uploaded the photos itself. Runs while signed in; see
 * useBackgroundDrain for when it runs and retries. Mounted once in the (app) layout.
 */
export function usePhotoUploadQueue() {
  const userId = useUserId();
  const { data: pending = 0 } = usePendingPhotoCount(userId);
  useBackgroundDrain(userId && `body-check:${userId}`, pending, () => uploadPendingPhotos(userId!));
}
