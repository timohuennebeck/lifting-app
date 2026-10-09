import { useQuery } from '@tanstack/react-query';

import { queryKeys } from './query-keys';
import { signedUrl } from './supabase-storage';

/** Private bucket of profile photos; objects live under "<user id>/...". */
export const AVATAR_BUCKET = 'avatars';
const URL_TTL_SECONDS = 60 * 60 * 24;

/** A time-limited URL of a profile photo; refreshed well before it expires. */
export function useAvatarUrl(path: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.profile.avatarUrl(path ?? '').queryKey,
    queryFn: () => signedUrl(AVATAR_BUCKET, path ?? '', URL_TTL_SECONDS),
    enabled: !!path,
    staleTime: (URL_TTL_SECONDS * 1000) / 2,
  });
}
