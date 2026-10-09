import { useAvatarUrl } from '@/shared/data/avatar';
import { useProfile } from '@/shared/data/profile';
import { Avatar, type AvatarProps } from '@/shared/ui/avatar';

export type UserAvatarProps = Omit<AvatarProps, 'name' | 'uri' | 'cacheKey'> & {
  /** Shown instead of the stored photo, e.g. one that is still uploading. */
  previewUri?: string | null;
};

/** The signed-in user's profile photo, or their initials. */
export function UserAvatar({ previewUri, ...props }: UserAvatarProps) {
  const { profile } = useProfile();
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
