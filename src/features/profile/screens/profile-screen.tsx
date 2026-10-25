import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Linking, View } from 'react-native';

import { useIsPro } from '@/features/paywall/stores/subscription-store';
import { OpenTicketsSection } from '@/features/support/components/open-tickets-section';
import { ProfileAvatar } from '@/shared/components/profile-avatar';
import { TabScreen } from '@/shared/components/tab-screen';
import { saveProfile, useProfile } from '@/shared/data/profile';
import { useWorkoutCount, useWorkoutHistory } from '@/shared/data/workouts';
import { formatDate } from '@/shared/lib/format';
import { haptics } from '@/shared/lib/haptics';
import { colors } from '@/shared/lib/theme';
import { showError } from '@/shared/stores/error-sheet-store';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { afterSheetClose } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

import { ActivityHeatmap } from '../components/activity-heatmap';
import { type AvatarAction, AvatarSheet } from '../components/avatar-sheet';
import { HistoryEntry } from '../components/history-entry';
import { NameSheet } from '../components/name-sheet';
import { type AvatarSource, pickAvatar, removeAvatar, saveAvatar } from '../lib/avatar';

const PAGE = 10;

interface LocalPhoto {
  uri: string;
  /** Its storage path once uploaded. */
  path: string | null;
  /** The photo it replaces, still in the profile until the change has loaded. */
  replaces: string | null;
}

export function ProfileScreen() {
  const { t } = useTranslation(['profile', 'common', 'paywall']);
  const { profile } = useProfile();
  const isPro = useIsPro();
  const [avatarOpen, setAvatarOpen] = useState(false);
  // A new photo shows from the device while it uploads and after (it is the same picture, so
  // there is no wait for the download), until the profile points at another one.
  const [local, setLocal] = useState<LocalPhoto | null>(null);
  const avatarPath = profile?.avatarPath ?? null;
  if (local?.path && avatarPath !== local.path && avatarPath !== local.replaces) setLocal(null);
  const uploading = !!local && !local.path;
  const [visible, setVisible] = useState(PAGE);
  const { data: history = [] } = useWorkoutHistory(visible);
  const { data: workoutCount = 0 } = useWorkoutCount();
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
    afterSheetClose(() => void pickPhoto(userId, action, previous));
  }

  async function pickPhoto(userId: string, source: AvatarSource, previous: string | null) {
    try {
      const picked = await pickAvatar(source);
      if (picked === 'denied') {
        showError({
          title: t('avatar.cameraDenied.title'),
          message: t('avatar.cameraDenied.message'),
          action: {
            label: t('common:actions.openSettings'),
            onPress: () => void Linking.openSettings(),
          },
          dismissLabel: t('common:actions.notNow'),
        });
        return;
      }
      if (picked) await uploadPhoto(userId, picked, previous);
    } catch (error) {
      console.warn('Picking the profile photo failed', error);
      haptics.error();
      showAvatarFailed(() => void pickPhoto(userId, source, previous));
    }
  }

  // Trying again uploads the same photo; it isn't picked anew.
  async function uploadPhoto(userId: string, uri: string, previous: string | null) {
    setLocal({ uri, path: null, replaces: previous });
    try {
      const path = await saveAvatar(userId, uri, previous);
      setLocal({ uri, path, replaces: previous });
      haptics.success();
    } catch (error) {
      console.warn('Saving the profile photo failed', error);
      haptics.error();
      setLocal(null);
      showAvatarFailed(() => void uploadPhoto(userId, uri, previous));
    }
  }

  const showAvatarFailed = (onRetry: () => void) =>
    showError({
      title: t('avatar.failed.title'),
      message: t('avatar.failed.message'),
      onRetry,
    });

  async function saveName(firstName: string) {
    if (!profile) return;
    await saveProfile(profile.id, { firstName });
    haptics.success();
    setNameOpen(false);
  }

  return (
    <TabScreen greeting={false} settings>
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
          className="mt-4.5 max-w-full flex-row items-center gap-2"
        >
          <Text
            numberOfLines={1}
            className="shrink font-inter-semibold text-[34px] leading-10 tracking-[-0.7px]"
          >
            {name}
          </Text>
          {/* Loqqa Pro: a neon check by the name. */}
          {isPro ? (
            <View accessible accessibilityLabel={t('paywall:settings.title')}>
              <Icon name="verified" size={26} color={colors.accent} />
            </View>
          ) : null}
        </PressableScale>
        {profile?.createdAt ? (
          <Text tone="muted" className="mt-3 text-sm">
            {t('memberSince', {
              date: formatDate(new Date(profile.createdAt), { month: 'long', year: 'numeric' }),
            })}
          </Text>
        ) : null}
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

      <OpenTicketsSection />

      <View className="mx-5 mt-7.5">
        <View className="flex-row items-baseline justify-between">
          <Text variant="overline" tone="subtle" className="text-[11px]">
            {t('activity')}
          </Text>
          <Text tone="subtle" className="text-xs">
            {t('lastMonths')}
          </Text>
        </View>
        <ActivityHeatmap />
      </View>

      <Text variant="overline" tone="subtle" className="mx-5 mt-7 mb-3 text-[11px]">
        {t('history')}
      </Text>
      <View className="mx-5">
        {history.length ? (
          history.map((w) => <HistoryEntry key={w.id} workout={w} profile={profile} />)
        ) : (
          <Text variant="paragraph" tone="subtle">
            {t('historyEmpty')}
          </Text>
        )}
      </View>
      {workoutCount > visible ? (
        <Button
          label={t('showMore')}
          variant="secondary"
          size="md"
          className="mx-5 mt-2"
          onPress={() => setVisible((v) => v + PAGE)}
        />
      ) : null}
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
