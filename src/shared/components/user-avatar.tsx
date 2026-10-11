import { useAvatarUrl } from '@/shared/data/avatar';
import type { Profile } from '@/shared/data/profile';
import { Avatar, type AvatarProps } from '@/shared/ui/avatar';

export interface ProfileAvatarProps extends Omit<AvatarProps, 'name' | 'uri' | 'cacheKey'> {
  profile: Pick<Profile, 'firstName' | 'avatarPath'> | null;
  /** Shown instead of the stored photo, e.g. one that is still uploading. */
  previewUri?: string | null;
}

/**
 * The user's profile photo, or their initials. Takes the profile the caller's screen already
 * has: every `useProfile` registers its own database watcher and re-runs the query on each change.
 */
export function ProfileAvatar({ profile, previewUri, ...props }: ProfileAvatarProps) {
  const path = profile?.avatarPath ?? null;
  const { data: url } = useAvatarUrl(path);
  return (
    <Avatar
      {...props}
      name={profile?.firstName ?? ''}
      uri={previewUri ?? url}
      cacheKey={previewUri ? undefined : (path ?? undefined)}
    />
  );
}
