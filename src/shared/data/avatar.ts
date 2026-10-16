import { useQuery } from '@tanstack/react-query';

import { DAY_MS } from '@/shared/lib/date';
import { storage } from '@/shared/lib/storage';

import { queryKeys } from './query-keys';
import { signedUrl } from './supabase-storage';

/** Private bucket of profile photos; objects live under "<user id>/...". */
export const AVATAR_BUCKET = 'avatars';
const URL_TTL_MS = DAY_MS;

interface SavedUrl {
  url: string;
  /** When it was signed. */
  at: number;
}

const savedKey = (path: string) => `avatar-url:${path}`;

/** The URL signed last for this photo, kept on the device while it is still well valid. */
function savedUrl(path: string): SavedUrl | undefined {
  try {
    const saved = JSON.parse(storage.getString(savedKey(path)) ?? 'null') as SavedUrl | null;
    return saved && Date.now() - saved.at < URL_TTL_MS / 2 ? saved : undefined;
  } catch {
    return undefined;
  }
}

/**
 * A time-limited URL of a profile photo, refreshed well before it expires. The last one is kept
 * on the device, so the photo shows at launch without waiting for the server (expo-image caches
 * the picture itself by its path).
 */
export function useAvatarUrl(path: string | null | undefined) {
  const saved = path ? savedUrl(path) : undefined;
  return useQuery({
    queryKey: queryKeys.profile.avatarUrl(path ?? '').queryKey,
    queryFn: async () => {
      const url = await signedUrl(AVATAR_BUCKET, path ?? '', URL_TTL_MS / 1000);
      storage.set(savedKey(path ?? ''), JSON.stringify({ url, at: Date.now() } satisfies SavedUrl));
      return url;
    },
    enabled: !!path,
    initialData: saved?.url,
    initialDataUpdatedAt: saved?.at,
    staleTime: URL_TTL_MS / 2,
  });
}
