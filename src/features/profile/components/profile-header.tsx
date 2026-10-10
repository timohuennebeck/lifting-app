import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Linking, View } from 'react-native';

import { ProBadge } from '@/features/paywall/components/pro-badge';
import { useIsPro } from '@/features/paywall/stores/subscription-store';
import { UserAvatar } from '@/shared/components/user-avatar';
import { saveProfile, useProfile } from '@/shared/data/profile';
import { useLastDefined } from '@/shared/hooks/use-last-defined';
import { formatDate } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';
import { haptics } from '@/shared/lib/haptics';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { afterSheetClose } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

import { pickAvatar, removeAvatar, saveAvatar } from '../lib/avatar';
import { type AvatarAction, AvatarSheet } from './avatar-sheet';
import { ProfileTextSheet } from './profile-text-sheet';

/** Matches the check on profiles.bio. */
const BIO_MAX = 150;
const NAME_MAX = 40;

interface LocalPhoto {
  uri: string;
  /** Its storage path once uploaded. */
  path: string | null;
  /** The photo it replaces, still in the profile until the change has loaded. */
  replaces: string | null;
}

/**
 * The fixed top of the profile, compact: the photo with name, membership and about beside it,
 * each editable by tapping (01b-2, 01b-3). Stays in place above the swipeable tabs.
 */
export function ProfileHeader() {
  const { t } = useTranslation(['profile', 'common']);
  const { profile } = useProfile();
  const isPro = useIsPro();
  const [avatarOpen, setAvatarOpen] = useState(false);
  // A new photo shows from the device while it uploads and after (it is the same picture, so
  // there is no wait for the download), until the profile points at another one.
  const [local, setLocal] = useState<LocalPhoto | null>(null);
  const avatarPath = profile?.avatarPath ?? null;
  if (local?.path && avatarPath !== local.path && avatarPath !== local.replaces) setLocal(null);
  const uploading = !!local && !local.path;

  async function onAvatarAction(action: AvatarAction) {
    setAvatarOpen(false);
    const userId = profile?.id;
    if (!userId) return;
    const previous = profile.avatarPath;
    if (action === 'remove') {
      setLocal(null);
      if (!previous) return;
      try {
        await removeAvatar(userId, previous);
      } catch (error) {
        console.warn('Removing the profile photo failed', error);
        haptics.error();
      }
      return;
    }
    // The system picker opens once the sheet has gone.
    afterSheetClose(async () => {
      try {
        const picked = await pickAvatar(action);
        if (picked === 'denied') {
          Alert.alert(t('avatar.cameraDenied'), undefined, [
            { text: t('common:actions.cancel'), style: 'cancel' },
            { text: t('common:settings'), onPress: () => void Linking.openSettings() },
          ]);
          return;
        }
        if (!picked) return;
        setLocal({ uri: picked, path: null, replaces: previous });
        const path = await saveAvatar(userId, picked, previous);
        setLocal({ uri: picked, path, replaces: previous });
        haptics.success();
      } catch (error) {
        console.warn('Saving the profile photo failed', error);
        haptics.error();
        setLocal(null);
        Alert.alert(t('avatar.failed'));
      }
    });
  }
  const name = profile?.firstName ?? '';
  const [editing, setEditing] = useState<'name' | 'about' | null>(null);
  const editingShown = useLastDefined(editing);

  async function saveText(value: string) {
    if (!profile) return;
    await saveProfile(
      profile.id,
      editing === 'name' ? { firstName: value } : { bio: value || null },
    );
    haptics.success();
    setEditing(null);
  }

  return (
    <>
      {/* Photo on the left, everything else beside it, so the tabs below get the room. */}
      <View className="flex-row items-start gap-4 px-5 pt-3">
        <PressableScale
          haptic="tap"
          accessibilityLabel={t('avatar.change')}
          disabled={uploading}
          onPress={() => setAvatarOpen(true)}
          className="rounded-full border-[2.5px] border-accent p-0.75"
        >
          <UserAvatar size={64} className="border-0" previewUri={local?.uri} />
          {uploading ? (
            <View className="absolute inset-0.75 items-center justify-center rounded-full bg-black/45">
              <ActivityIndicator color={colors.fg} />
            </View>
          ) : null}
          <View className="absolute -right-0.5 -bottom-0.5 size-6 items-center justify-center rounded-full border-[2.5px] border-bg bg-elevated">
            <Icon name="photo-camera" size={11} color={colors.fg} />
          </View>
        </PressableScale>
        <View className="min-w-0 flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            <PressableScale
              haptic="tap"
              activeScale={0.98}
              accessibilityLabel={t('name.edit')}
              onPress={() => setEditing('name')}
              className="min-w-0 shrink"
            >
              <Text numberOfLines={1} className="font-inter-semibold text-[22px] leading-7">
                {name}
              </Text>
            </PressableScale>
            {isPro ? <ProBadge className="self-center" /> : null}
          </View>
          {profile?.createdAt ? (
            <Text tone="muted" className="text-[13px] leading-4.5">
              {t('memberSince', {
                date: formatDate(new Date(profile.createdAt), { month: 'long', year: 'numeric' }),
              })}
            </Text>
          ) : null}
          {/* The user's own description; tapping it edits it (01b-3). */}
          <PressableScale
            haptic="tap"
            activeScale={0.98}
            accessibilityLabel={t(profile?.bio ? 'about.edit' : 'about.add')}
            onPress={() => setEditing('about')}
            className="mt-1"
          >
            <Text
              variant="paragraph"
              numberOfLines={2}
              className={cn('text-sm leading-5', profile?.bio ? 'text-fg-mid' : 'text-dim')}
            >
              {profile?.bio || t('about.add')}
            </Text>
          </PressableScale>
        </View>
      </View>
      <AvatarSheet
        visible={avatarOpen}
        onClose={() => setAvatarOpen(false)}
        hasPhoto={!!profile?.avatarPath}
        onAction={onAvatarAction}
      />
      <ProfileTextSheet
        visible={!!editing}
        onClose={() => setEditing(null)}
        title={t(`${editingShown ?? 'name'}.title`)}
        subtitle={t(`${editingShown ?? 'name'}.subtitle`)}
        label={t(`${editingShown ?? 'name'}.label`)}
        placeholder={t(`${editingShown ?? 'name'}.placeholder`)}
        initialValue={(editingShown === 'about' ? profile?.bio : profile?.firstName) ?? ''}
        maxLength={editingShown === 'about' ? BIO_MAX : NAME_MAX}
        multiline={editingShown === 'about'}
        optional={editingShown === 'about'}
        onSave={saveText}
      />
    </>
  );
}
