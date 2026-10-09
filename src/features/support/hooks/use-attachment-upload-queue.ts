import { useBackgroundDrain } from '@/shared/hooks/use-background-drain';
import { useUserId } from '@/shared/stores/session-store';

import { localAttachment, uploadAttachment } from '../data/attachments';
import { useUploadQueueStore } from '../stores/upload-queue-store';

const ownPath = (userId: string | null, path: string) => !!userId && path.startsWith(`${userId}/`);

// One drain at a time app-wide.
let draining: Promise<boolean> | null = null;

/** Uploads this account's queued screenshots; false if one failed. */
function drainQueue(userId: string) {
  draining ??= (async () => {
    const { pending, done } = useUploadQueueStore.getState();
    for (const path of pending.filter((p) => ownPath(userId, p))) {
      // The local copy is gone (e.g. app data cleared): nothing left to upload.
      if (!localAttachment(path).exists) {
        done(path);
        continue;
      }
      try {
        await uploadAttachment(path);
        done(path);
      } catch (error) {
        console.warn('Screenshot upload failed; retrying later', error);
        return false;
      }
    }
    return true;
  })().finally(() => {
    draining = null;
  });
  return draining;
}

/** Background upload of ticket screenshots; mounted once in the (app) layout. */
export function useAttachmentUploadQueue() {
  const userId = useUserId();
  const pending = useUploadQueueStore((s) => s.pending.filter((p) => ownPath(userId, p)).length);
  useBackgroundDrain(pending, () => drainQueue(userId!), 'Support upload');
}
