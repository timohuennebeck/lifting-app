import { useAvatarUrl } from '@/shared/data/avatar';
import { type Profile, useProfile } from '@/shared/data/profile';
import { Avatar, type AvatarProps } from '@/shared/ui/avatar';

export type UserAvatarProps = Omit<AvatarProps, 'name' | 'uri' | 'cacheKey'> & {
  /** Shown instead of the stored photo, e.g. one that is still uploading. */
  previewUri?: string | null;
};

/** The signed-in user's profile photo, or their initials. */
export function UserAvatar(props: UserAvatarProps) {
  const { profile } = useProfile();
  return <ProfileAvatar {...props} profile={profile} />;
}

export interface ProfileAvatarProps extends UserAvatarProps {
  profile: Pick<Profile, 'firstName' | 'avatarPath'> | null;
}

/**
 * `UserAvatar` for a profile the caller already has, e.g. list rows from their screen: every
 * `useProfile` registers its own database watcher and re-runs the query on each change.
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
