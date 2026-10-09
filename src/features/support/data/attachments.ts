import { useQuery } from '@tanstack/react-query';
import { File } from 'expo-file-system';

import { queryClient } from '@/shared/data/query-client';
import { supabase } from '@/shared/data/supabase';

import { supportKeys } from './support-keys';

const BUCKET = 'ticket-attachments';
const URL_TTL_SECONDS = 60 * 60;
// Refresh signed URLs five minutes before they expire.
const URL_FRESH_MS = (URL_TTL_SECONDS - 5 * 60) * 1000;

/** Object paths must start with the user id (storage policy). */
export const attachmentPath = (userId: string, ticketId: string, fileId: string) =>
  `${userId}/${ticketId}/${fileId}.jpg`;

/** Uploads a compressed JPEG; retrying the same path overwrites a partial upload. */
export async function uploadAttachment(path: string, localUri: string) {
  const bytes = await new File(localUri).arrayBuffer();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: 'image/jpeg', upsert: true });
  if (error) throw error;
  // The sender sees the local copy right away instead of waiting for a signed URL.
  queryClient.setQueryData(supportKeys.attachmentUrl(path).queryKey, localUri);
}

/** Cached signed URL for a private screenshot. */
export function useAttachmentUrl(path: string) {
  return useQuery({
    queryKey: supportKeys.attachmentUrl(path).queryKey,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(path, URL_TTL_SECONDS);
      if (error) throw error;
      return data.signedUrl;
    },
    staleTime: URL_FRESH_MS,
    gcTime: URL_FRESH_MS,
  });
}
