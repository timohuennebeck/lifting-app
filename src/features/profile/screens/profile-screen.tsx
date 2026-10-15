import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Linking, View } from 'react-native';

import { ProBadge } from '@/features/paywall/components/pro-badge';
import { useIsPro } from '@/features/paywall/stores/subscription-store';
import { useHasUnreadTicket } from '@/features/support/hooks/use-has-unread-ticket';
import { TabScreen } from '@/shared/components/tab-screen';
import { ProfileAvatar } from '@/shared/components/user-avatar';
import { saveProfile, useProfile } from '@/shared/data/profile';
import { formatDate } from '@/shared/lib/format';
import { haptics } from '@/shared/lib/haptics';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { afterSheetClose } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

import { ActivityHeatmap } from '../components/activity-heatmap';
import { type AvatarAction, AvatarSheet } from '../components/avatar-sheet';
import { NameSheet } from '../components/name-sheet';
import { pickAvatar, removeAvatar, saveAvatar } from '../lib/avatar';

interface LocalPhoto {
  uri: string;
  /** Its storage path once uploaded. */
  path: string | null;
  /** The photo it replaces, still in the profile until the change has loaded. */
  replaces: string | null;
}

export function ProfileScreen() {
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
  const unread = useHasUnreadTicket();
  const name = profile?.firstName ?? '';
  const [nameOpen, setNameOpen] = useState(false);

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

  async function saveName(firstName: string) {
    if (!profile) return;
    await saveProfile(profile.id, { firstName });
    haptics.success();
    setNameOpen(false);
  }

  return (
    <TabScreen greeting={false} settings settingsBadge={unread}>
      <View className="items-start px-5 pt-4">
        <PressableScale
          haptic="tap"
          accessibilityLabel={t('avatar.change')}
          disabled={uploading}
          onPress={() => setAvatarOpen(true)}
          className="rounded-full border-[3px] border-accent p-1"
        >
          <ProfileAvatar
            profile={profile}
            size={106}
            className="border-0"
            previewUri={local?.uri}
          />
          {uploading ? (
            <View className="absolute inset-1 items-center justify-center rounded-full bg-black/45">
              <ActivityIndicator color={colors.fg} />
            </View>
          ) : null}
          <View className="absolute right-0 bottom-0 size-9 items-center justify-center rounded-full border-[3px] border-bg bg-elevated">
            <Icon name="photo-camera" size={15} color={colors.fg} />
          </View>
        </PressableScale>
        <PressableScale
          haptic="tap"
          activeScale={0.98}
          accessibilityLabel={t('name.edit')}
          onPress={() => setNameOpen(true)}
          className="mt-4.5"
        >
          <Text className="font-inter-semibold text-[34px] leading-10 tracking-[-0.7px]">
            {name}
          </Text>
        </PressableScale>
        <View className="mt-3 flex-row items-center gap-2.5">
          {isPro ? <ProBadge className="self-center" /> : null}
          {profile?.createdAt ? (
            <Text tone="muted" className="text-sm">
              {t('memberSince', {
                date: formatDate(new Date(profile.createdAt), { month: 'long', year: 'numeric' }),
              })}
            </Text>
          ) : null}
        </View>
        {/* The user's own description; tapping it opens "Über dich" to edit it. */}
        <PressableScale
          haptic="tap"
          activeScale={0.98}
          accessibilityLabel={t(profile?.bio ? 'about.edit' : 'about.add')}
          onPress={() => router.push('/about')}
          className="mt-4.5 self-stretch"
        >
          <Text variant="paragraph" className={profile?.bio ? 'text-fg-mid' : 'text-dim'}>
            {profile?.bio || t('about.add')}
          </Text>
        </PressableScale>
      </View>

      {/* The workouts behind the grid are in Fortschritt → Verlauf. */}
      <PressableScale
        haptic="tap"
        activeScale={0.98}
        accessibilityRole="button"
        accessibilityLabel={t('activity')}
        accessibilityHint={t('openHistory')}
        onPress={() => router.navigate('/progress')}
        className="mx-5 mt-8.5"
      >
        <View className="flex-row items-center justify-between">
          <Text variant="overline" tone="subtle" className="text-[11px]">
            {t('activity')}
          </Text>
          <View className="flex-row items-center gap-1.5">
            <Text tone="subtle" className="text-xs">
              {t('lastMonths')}
            </Text>
            <Icon name="chevron-right" size={6} color={colors.dim} />
          </View>
        </View>
        <ActivityHeatmap />
      </PressableScale>
      <AvatarSheet
        visible={avatarOpen}
        onClose={() => setAvatarOpen(false)}
        hasPhoto={!!profile?.avatarPath}
        onAction={onAvatarAction}
      />
      <NameSheet
        visible={nameOpen}
        onClose={() => setNameOpen(false)}
        initialValue={profile?.firstName ?? ''}
        onSave={saveName}
      />
    </TabScreen>
  );
}
