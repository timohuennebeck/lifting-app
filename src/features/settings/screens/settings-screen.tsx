import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { type Href, router, Stack } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { legalHref } from '@/features/legal/lib/legal-href';
import { useIsPro } from '@/features/paywall/stores/subscription-store';
import { useUploadQueueStore } from '@/features/support/stores/upload-queue-store';
import { LanguageSheet } from '@/shared/components/language-sheet';
import { ProfileAvatar } from '@/shared/components/profile-avatar';
import { db } from '@/shared/data/powersync/database';
import { saveProfile, useProfile } from '@/shared/data/profile';
import { supabase } from '@/shared/data/supabase';
import { useAppLanguage } from '@/shared/hooks/use-app-language';
import { LANGUAGE_NAMES } from '@/shared/i18n/resources';
import { haptics } from '@/shared/lib/haptics';
import { showError } from '@/shared/stores/error-sheet-store';
import { requireUserId, useSessionStore } from '@/shared/stores/session-store';
import { Button } from '@/shared/ui/button';
import { LanguageFlag } from '@/shared/ui/language-flag';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { afterSheetClose } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';
import { TextButton } from '@/shared/ui/text-button';

import { DeleteAccountSheet } from '../components/delete-account-sheet';
import { NotificationsSection } from '../components/notifications-section';
import { ProSection } from '../components/pro-section';
import { SignOutSheet } from '../components/sign-out-sheet';
import { UnitBadge } from '../components/unit-badge';
import { deleteAccount } from '../lib/delete-account';

type OpenSheet = 'language' | 'signOut' | 'delete';

/** The app version and build number, e.g. "1.0.0 (2)": tells TestFlight builds apart. */
const BUILD = Application.nativeBuildVersion;
const VERSION = `${Constants.expoConfig?.version ?? ''}${BUILD ? ` (${BUILD})` : ''}`;

const LINKS: { key: 'help' | 'privacy' | 'terms'; href: Href }[] = [
  { key: 'help', href: '/support' },
  { key: 'privacy', href: legalHref('privacy') },
  { key: 'terms', href: legalHref('terms') },
];

export function SettingsScreen() {
  const { t } = useTranslation(['profile', 'common']);
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const isPro = useIsPro();
  const email = useSessionStore((s) => s.session?.user.email) ?? '';
  const language = useAppLanguage();
  const [sheet, setSheet] = useState<OpenSheet | null>(null);
  const [unsynced, setUnsynced] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const units = profile?.unitPreference ?? 'metric';
  const close = () => setSheet(null);

  const signOut = () => {
    haptics.warning();
    void supabase.auth.signOut();
  };

  // Signing out clears the local database and files, including anything not uploaded yet
  // (queued changes, support screenshots): the sheet warns about those.
  const requestSignOut = async () => {
    const { count: changes } = await db.getUploadQueueStats();
    setUnsynced(changes + useUploadQueueStore.getState().pending.length);
    setSheet('signOut');
  };

  const removeAccount = async () => {
    setDeleting(true);
    try {
      // The root guard leaves the app once the session is gone. Closing Apple's sheet cancels.
      if (!(await deleteAccount(requireUserId()))) setDeleting(false);
    } catch (error) {
      console.warn('Deleting the account failed', error);
      haptics.error();
      setDeleting(false);
      close();
      // Trying again reopens the delete sheet, which shows the deletion running.
      afterSheetClose(() =>
        showError({
          title: t('settings.deleteConfirm.failed.title'),
          message: t('settings.deleteConfirm.failed.message'),
          onRetry: () => {
            setSheet('delete');
            void removeAccount();
          },
        }),
      );
    }
  };

  return (
    <Screen scroll header={<ScreenHeader title={t('common:settings')} />}>
      <Stack.Screen options={{ animation: 'slide_from_right', gestureEnabled: true }} />

      <View className="gap-2.5 px-4 pt-4">
        <View className="flex-row items-center gap-3.5 rounded-[22px] bg-surface p-4">
          <ProfileAvatar profile={profile} size={52} />
          <View className="min-w-0 flex-1 gap-0.5">
            <Text variant="bodyStrong" numberOfLines={1}>
              {profile?.firstName ?? ''}
            </Text>
            {email ? (
              <Text tone="subtle" className="text-sm" numberOfLines={1}>
                {email}
              </Text>
            ) : null}
          </View>
        </View>

        <View className="flex-row gap-2.5">
          <PreferenceCard
            label={t('settings.language')}
            value={LANGUAGE_NAMES[language]}
            icon={<LanguageFlag language={language} size={32} />}
            onPress={() => setSheet('language')}
          />
          <PreferenceCard
            label={t('settings.units')}
            value={t(units === 'metric' ? 'settings.kilograms' : 'settings.pounds')}
            icon={<UnitBadge units={units} />}
            // Two options: a tap switches to the other one.
            onPress={() =>
              void saveProfile(requireUserId(), {
                unitPreference: units === 'metric' ? 'imperial' : 'metric',
              })
            }
          />
        </View>
      </View>

      <NotificationsSection />

      <ProSection />

      <View className="flex-row flex-wrap gap-2 px-4 pt-7">
        {LINKS.map((link) => (
          <PressableScale
            key={link.key}
            activeScale={0.98}
            haptic="select"
            accessibilityRole="link"
            onPress={() => router.push(link.href)}
            className="h-10 justify-center rounded-full bg-pill px-4"
          >
            <Text variant="caption" className="text-sm">
              {t(`settings.links.${link.key}`)}
            </Text>
          </PressableScale>
        ))}
      </View>

      <View className="items-center px-4 pt-8" style={{ paddingBottom: insets.bottom + 8 }}>
        <Button
          label={t('settings.signOut')}
          variant="secondary"
          className="self-stretch"
          onPress={requestSignOut}
        />
        <TextButton
          label={t('settings.deleteAccount')}
          tone="danger"
          haptic="select"
          className="mt-2"
          onPress={() => setSheet('delete')}
        />
        <Text tone="subtle" className="pt-2 text-xs">
          {t('settings.version', { version: VERSION })}
        </Text>
      </View>

      <LanguageSheet visible={sheet === 'language'} onClose={close} />
      <SignOutSheet
        visible={sheet === 'signOut'}
        onClose={close}
        profile={profile}
        email={email}
        unsynced={unsynced}
        onSignOut={() => {
          close();
          afterSheetClose(signOut);
        }}
      />
      <DeleteAccountSheet
        visible={sheet === 'delete'}
        onClose={close}
        subscribed={isPro}
        deleting={deleting}
        onDelete={removeAccount}
      />
    </Screen>
  );
}

interface PreferenceCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  onPress: () => void;
}

/** Half-width card: an icon, then the setting and its value (language, units). */
function PreferenceCard({ label, value, icon, onPress }: PreferenceCardProps) {
  return (
    // A plain slot takes the half: a card's own padding would skew the widths.
    <View className="min-w-0 flex-1">
      <PressableScale
        haptic="tap"
        activeScale={0.98}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${value}`}
        onPress={onPress}
        className="gap-3.5 rounded-[22px] bg-surface p-4"
      >
        {icon}
        <View className="gap-0.5">
          <Text tone="subtle" className="text-sm">
            {label}
          </Text>
          <Text variant="bodyStrong" numberOfLines={1}>
            {value}
          </Text>
        </View>
      </PressableScale>
    </View>
  );
}
