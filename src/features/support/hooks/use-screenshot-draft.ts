import { useRef, useState } from 'react';

import { newId } from '@/shared/data/json';
import { haptics } from '@/shared/lib/haptics';

import { attachmentPath, uploadAttachment } from '../data/attachments';
import { compressScreenshot, MAX_SCREENSHOTS, pickScreenshots } from '../lib/screenshots';

export interface DraftShot {
  id: string;
  uri: string;
  /** False while the picked image is still being compressed. */
  ready: boolean;
  /** Storage path once uploaded; kept so a retry skips finished files. */
  path: string | null;
  failed: boolean;
}

/** Screenshots attached to a ticket or message: pick, compress, upload with retry. */
export function useScreenshotDraft() {
  const [shots, setShotsState] = useState<DraftShot[]>([]);
  const [uploading, setUploading] = useState(false);
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
      path: null,
      failed: false,
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

  /** Uploads every file not uploaded yet. Resolves with all paths, or null if any failed. */
  async function upload(userId: string, ticketId: string) {
    setUploading(true);
    let ok = true;
    for (const shot of latest.current) {
      if (shot.path) continue;
      const path = attachmentPath(userId, ticketId, shot.id);
      try {
        patch(shot.id, { failed: false });
        await uploadAttachment(path, shot.uri);
        patch(shot.id, { path });
      } catch (error) {
        console.warn('Screenshot upload failed', error);
        ok = false;
        patch(shot.id, { failed: true });
      }
    }
    setUploading(false);
    if (!ok) haptics.error();
    return ok ? latest.current.map((s) => s.path ?? '') : null;
  }

  return {
    shots,
    add,
    remove,
    reset,
    upload,
    uploading,
    canAdd: shots.length < MAX_SCREENSHOTS,
    /** Still compressing a picked image. */
    preparing: shots.some((s) => !s.ready),
    failed: shots.some((s) => s.failed),
    uploaded: shots.filter((s) => s.path).length,
  };
}

export type ScreenshotDraft = ReturnType<typeof useScreenshotDraft>;
