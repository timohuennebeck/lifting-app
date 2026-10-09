import { useQuery } from '@tanstack/react-query';
import { Directory, File, Paths } from 'expo-file-system';

import { signedUrl, uploadJpeg } from '@/shared/data/supabase-storage';

import { supportKeys } from './support-keys';

const BUCKET = 'ticket-attachments';
const URL_TTL_SECONDS = 60 * 60;
// Refresh signed URLs five minutes before they expire.
const URL_FRESH_MS = (URL_TTL_SECONDS - 5 * 60) * 1000;

/** Object paths must start with the user id (storage policy). */
export const attachmentPath = (userId: string, ticketId: string, fileId: string) =>
  `${userId}/${ticketId}/${fileId}.jpg`;

/** Device copy of a screenshot, kept under its bucket path for offline sending and display. */
export const localAttachment = (path: string) =>
  new File(Paths.document, BUCKET, ...path.split('/'));

/** Copies a compressed screenshot to its permanent local place before the message is saved. */
export function keepLocalCopy(path: string, sourceUri: string) {
  const parts = path.split('/');
  new Directory(Paths.document, BUCKET, ...parts.slice(0, -1)).create({
    intermediates: true,
    idempotent: true,
  });
  new File(sourceUri).copySync(localAttachment(path), { overwrite: true });
}

/** Removes every local screenshot copy, e.g. when the account signs out. */
export function clearLocalAttachments() {
  const root = new Directory(Paths.document, BUCKET);
  if (root.exists) root.delete();
}

/** Uploads the local copy; retrying the same path overwrites a partial upload. */
export const uploadAttachment = (path: string) => uploadJpeg(BUCKET, path, localAttachment(path));

/** Local copy when this device sent it, otherwise a cached signed URL. */
export function useAttachmentUrl(path: string) {
  return useQuery({
    queryKey: supportKeys.attachmentUrl(path).queryKey,
    queryFn: async () => {
      const local = localAttachment(path);
      return local.exists ? local.uri : signedUrl(BUCKET, path, URL_TTL_SECONDS);
    },
    staleTime: URL_FRESH_MS,
    gcTime: URL_FRESH_MS,
  });
}
