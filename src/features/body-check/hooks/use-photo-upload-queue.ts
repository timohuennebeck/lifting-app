import { useStatus } from '@powersync/react';
import { and, eq, isNull } from 'drizzle-orm';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { drizzle } from '@/shared/data/powersync/database';
import { bodyCheckPhotos } from '@/shared/data/powersync/schema';
import { supabase } from '@/shared/data/supabase';
import { useUserId } from '@/shared/stores/session-store';

import { setPhotoStoragePath } from '../data/body-check-mutations';
import { usePendingPhotoCount } from '../data/body-checks';
import { PHOTO_BUCKET, photoFile, storagePathOf } from '../lib/photo-files';
import type { BodyPose } from '../lib/poses';

/** Waits before the next attempt after consecutive failures. */
const RETRY_DELAYS_MS = [15_000, 60_000, 5 * 60_000, 15 * 60_000];

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
 * Background upload of body-check photos to Supabase Storage. Runs while signed in
 * whenever photos are pending, the sync connection comes back or the app returns to
 * the foreground; failures back off and retry. Mount once in a long-lived screen.
 */
export function usePhotoUploadQueue() {
  const userId = useUserId();
  const { connected } = useStatus();
  const { data: pending = 0 } = usePendingPhotoCount(userId);
  const [attempt, setAttempt] = useState(0);
  const failures = useRef(0);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setAttempt((n) => n + 1);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!userId || !pending) return;
    let active = true;
    let retry: ReturnType<typeof setTimeout> | undefined;
    drainQueue(userId)
      .then((ok) => {
        if (!active) return;
        if (ok) {
          failures.current = 0;
          return;
        }
        const delay = RETRY_DELAYS_MS[Math.min(failures.current, RETRY_DELAYS_MS.length - 1)];
        failures.current += 1;
        retry = setTimeout(() => setAttempt((n) => n + 1), delay);
      })
      .catch((error) => console.warn('Body-check upload queue failed', error));
    return () => {
      active = false;
      clearTimeout(retry);
    };
  }, [userId, pending, connected, attempt]);
}
