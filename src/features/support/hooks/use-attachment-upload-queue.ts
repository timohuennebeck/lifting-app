import { useBackgroundDrain } from '@/shared/hooks/use-background-drain';
import { useUserId } from '@/shared/stores/session-store';

import { localAttachment, uploadAttachment } from '../data/attachments';
import { useUploadQueueStore } from '../stores/upload-queue-store';

const ownPath = (userId: string | null, path: string) => !!userId && path.startsWith(`${userId}/`);

/**
 * Uploads this account's queued screenshots, re-reading the queue until nothing is left so
 * paths added during a run are not missed. A failing file doesn't block the others.
 * Resolves false if one failed.
 */
async function uploadQueued(userId: string) {
  const failed = new Set<string>();
  for (;;) {
    const { pending, done } = useUploadQueueStore.getState();
    const next = pending.find((p) => ownPath(userId, p) && !failed.has(p));
    if (!next) return failed.size === 0;
    // The local copy is gone (e.g. app data cleared): nothing left to upload.
    if (!localAttachment(next).exists) {
      done(next);
      continue;
    }
    try {
      await uploadAttachment(next);
      done(next);
    } catch (error) {
      console.warn('Screenshot upload failed; retrying later', error);
      failed.add(next);
    }
  }
}

/** Background upload of ticket screenshots; mounted once in the (app) layout. */
export function useAttachmentUploadQueue() {
  const userId = useUserId();
  const pending = useUploadQueueStore((s) => s.pending.filter((p) => ownPath(userId, p)).length);
  useBackgroundDrain(userId && `support:${userId}`, pending, () => uploadQueued(userId!));
}
