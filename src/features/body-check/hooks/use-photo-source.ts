import { useQuery } from '@tanstack/react-query';
import type { ImageSource } from 'expo-image';
import { useMemo } from 'react';

import { supabase } from '@/shared/data/supabase';

import { bodyCheckPhotoKeys } from '../data/body-check-keys';
import { PHOTO_BUCKET, photoFile } from '../lib/photo-files';
import type { BodyPose } from '../lib/poses';

const SIGNED_URL_SECONDS = 60 * 60;
// Refresh well before the signed URL expires.
const SIGNED_URL_STALE_MS = 50 * 60 * 1000;

async function signedUrl(storagePath: string) {
  const { data, error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_SECONDS);
  if (error) throw error;
  return data.signedUrl;
}

/**
 * Image source of a saved check photo: the local file when this device took it,
 * otherwise a signed URL of the uploaded copy. Null while neither is available.
 */
export function usePhotoSource(
  checkId: string,
  pose: BodyPose,
  storagePath: string | null | undefined,
): ImageSource | null {
  const localUri = useMemo(() => {
    const file = photoFile(checkId, pose);
    return file.exists ? file.uri : null;
  }, [checkId, pose]);
  const remote = !localUri && !!storagePath;
  const { data: url } = useQuery({
    queryKey: bodyCheckPhotoKeys.signedUrl(storagePath ?? '').queryKey,
    queryFn: () => signedUrl(storagePath ?? ''),
    enabled: remote,
    staleTime: SIGNED_URL_STALE_MS,
    gcTime: SIGNED_URL_STALE_MS,
  });
  if (localUri) return { uri: localUri };
  // The signed URL changes per request; cache the image under its stable path.
  if (remote && url) return { uri: url, cacheKey: storagePath ?? undefined };
  return null;
}
