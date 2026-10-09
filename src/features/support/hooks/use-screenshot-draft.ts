import { useRef, useState } from 'react';

import { newId } from '@/shared/data/json';
import { haptics } from '@/shared/lib/haptics';

import { attachmentPath, keepLocalCopy } from '../data/attachments';
import { useUploadQueueStore } from '../stores/upload-queue-store';
import { compressScreenshot, MAX_SCREENSHOTS, pickScreenshots } from '../lib/screenshots';

export interface DraftShot {
  id: string;
  uri: string;
  /** False while the picked image is still being compressed. */
  ready: boolean;
}

/** Screenshots attached to a ticket or message: pick, compress, then queue for upload. */
export function useScreenshotDraft() {
  const [shots, setShotsState] = useState<DraftShot[]>([]);
  // Async work reads the latest list from here, not from a stale render.
  const latest = useRef<DraftShot[]>([]);

  function setShots(update: (prev: DraftShot[]) => DraftShot[]) {
    latest.current = update(latest.current);
    setShotsState(latest.current);
  }
  const patch = (id: string, change: Partial<DraftShot>) =>
    setShots((prev) => prev.map((s) => (s.id === id ? { ...s, ...change } : s)));

  async function add() {
    const picked = await pickScreenshots(MAX_SCREENSHOTS - latest.current.length);
    if (!picked.length) return;
    const added = picked.map((p) => ({
      id: newId(),
      uri: p.uri,
      ready: false,
    }));
    setShots((prev) => [...prev, ...added].slice(0, MAX_SCREENSHOTS));
    await Promise.all(
      added.map(async (shot, i) => {
        try {
          patch(shot.id, { uri: await compressScreenshot(picked[i]), ready: true });
        } catch {
          haptics.error();
          setShots((prev) => prev.filter((s) => s.id !== shot.id));
        }
      }),
    );
  }

  const remove = (id: string) => setShots((prev) => prev.filter((s) => s.id !== id));
  const reset = () => setShots(() => []);

  /**
   * Copies the screenshots to their bucket paths on the device, runs `write` with those
   * paths (the message's attachments), and queues them for the background upload once
   * the write succeeded.
   */
  async function save(
    userId: string,
    ticketId: string,
    write: (attachments: string[]) => Promise<unknown>,
  ) {
    const attachments = latest.current.map((shot) => {
      const path = attachmentPath(userId, ticketId, shot.id);
      keepLocalCopy(path, shot.uri);
      return path;
    });
    await write(attachments);
    useUploadQueueStore.getState().enqueue(attachments);
  }

  return {
    shots,
    add,
    remove,
    reset,
    save,
    canAdd: shots.length < MAX_SCREENSHOTS,
    /** Still compressing a picked image. */
    preparing: shots.some((s) => !s.ready),
  };
}

export type ScreenshotDraft = ReturnType<typeof useScreenshotDraft>;
