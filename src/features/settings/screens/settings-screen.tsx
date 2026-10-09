import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { countLocalPendingPhotos } from '@/features/body-check/data/body-checks';
import { LEGAL_KINDS } from '@/features/legal/data/legal-documents';
import { useUploadQueueStore } from '@/features/support/stores/upload-queue-store';
import { db } from '@/shared/data/powersync/database';
import { type ProfilePatch, saveProfile, useProfile } from '@/shared/data/profile';
import { supabase } from '@/shared/data/supabase';
import { APP_LANGUAGES, type AppLanguage } from '@/shared/i18n/resources';
import { cn } from '@/shared/lib/cn';
import { formatHeight, formatWeight, type UnitSystem } from '@/shared/lib/format';
import { haptics } from '@/shared/lib/haptics';
import { colors } from '@/shared/lib/theme';
import { requireUserId } from '@/shared/stores/session-store';
import { ACCENT_OPTIONS, useSettingsStore } from '@/shared/stores/settings-store';
import { Button } from '@/shared/ui/button';
import { CheckBadge } from '@/shared/ui/check-item';
import { Icon } from '@/shared/ui/icon';
import { LanguageFlag } from '@/shared/ui/language-flag';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { SegmentedControl } from '@/shared/ui/segmented-control';
import { Text } from '@/shared/ui/text';

import { type BodyField, BodyFieldSheet } from '../components/body-field-sheet';
import { ProSection } from '../components/pro-section';
import { SettingsRow, SettingsSection } from '../components/settings-section';

interface BodyRow {
  field: BodyField;
  value: string;
}

export function SettingsScreen() {
  const { t, i18n } = useTranslation('profile');
  const { t: tc } = useTranslation();
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const language = useSettingsStore((s) => s.language) ?? (i18n.language as AppLanguage);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const accent = useSettingsStore((s) => s.accent);
  const setAccent = useSettingsStore((s) => s.setAccent);
  const [editing, setEditing] = useState<BodyField | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [session, setSession] = useState(0);

  const units = profile?.unitSystem ?? 'metric';
  const save = (patch: ProfilePatch) => saveProfile(requireUserId(), patch);
  const edit = (field: BodyField) => {
    setEditing(field);
    setSession((s) => s + 1);
    setSheetOpen(true);
  };

  const signOut = async () => {
    // Signing out clears the local database and photo files, including anything not
    // uploaded yet: queued changes, body-check photos and support screenshots.
    const [{ count: changes }, photos] = await Promise.all([
      db.getUploadQueueStats(),
      countLocalPendingPhotos(requireUserId()),
    ]);
    const count = changes + photos + useUploadQueueStore.getState().pending.length;
    Alert.alert(
      t('settings.signOutConfirm.title'),
      count > 0
        ? t('settings.signOutConfirm.unsynced', { count })
        : t('settings.signOutConfirm.body'),
      [
        { text: tc('actions.cancel'), style: 'cancel' },
        {
          text: t('settings.signOut'),
          style: 'destructive',
          onPress: () => {
            haptics.warning();
            supabase.auth.signOut();
          },
        },
      ],
    );
  };

  const notSet = t('settings.notSet');
  const bodyRows: BodyRow[] = [
    { field: 'firstName', value: profile?.firstName || notSet },
    { field: 'sex', value: profile?.sex ? t(`settings.sexes.${profile.sex}`) : notSet },
    { field: 'age', value: profile?.age ? String(profile.age) : notSet },
    {
      field: 'weight',
      value: profile?.weightKg ? formatWeight(profile.weightKg, units) : notSet,
    },
    { field: 'height', value: profile?.heightCm ? formatHeight(profile.heightCm, units) : notSet },
  ];

  return (
    <Screen
      scroll
      header={
        <ScreenHeader
          className="pt-2.5"
          iconSize={9}
          title={<Text variant="headline">{tc('settings')}</Text>}
        />
      }
    >
      <Stack.Screen options={{ animation: 'slide_from_right', gestureEnabled: true }} />

      <ProSection />

      <SettingsSection title={t('settings.language')}>
        {APP_LANGUAGES.map((lang, i) => (
          <SettingsRow
            key={lang}
            first={i === 0}
            label={tc(`languages.${lang}`)}
            accessibilityRole="radio"
            selected={lang === language}
            leading={<LanguageFlag language={lang} size={28} />}
            trailing={
              lang === language ? (
                <CheckBadge size={24} glyph={12} />
              ) : (
                <View className="size-6 rounded-full border-[1.5px] border-outline" />
              )
            }
            onPress={() => setLanguage(lang)}
          />
        ))}
      </SettingsSection>

      <SettingsSection title={t('settings.accent')}>
        <View className="flex-row flex-wrap justify-between gap-2 p-4">
          {ACCENT_OPTIONS.map((color) => (
            <PressableScale
              key={color}
              haptic="select"
              accessibilityRole="radio"
              accessibilityLabel={color}
              accessibilityState={{ checked: color === accent }}
              onPress={() => setAccent(color)}
              className={cn(
                'size-11 items-center justify-center rounded-full border-2',
                color === accent ? 'border-fg' : 'border-transparent',
              )}
            >
              <View
                className="size-8.5 items-center justify-center rounded-full"
                style={{ backgroundColor: color }}
              >
                {color === accent ? <Icon name="check" size={13} color={colors.onAccent} /> : null}
              </View>
            </PressableScale>
          ))}
        </View>
      </SettingsSection>

      <SettingsSection title={t('settings.units')}>
        <View className="p-3">
          <SegmentedControl<UnitSystem>
            options={[
              { value: 'metric', label: t('settings.metric') },
              { value: 'imperial', label: t('settings.imperial') },
            ]}
            value={units}
            onChange={(unitSystem) => save({ unitSystem })}
          />
        </View>
      </SettingsSection>

      <SettingsSection title={t('settings.bodyData')}>
        {bodyRows.map((row, i) => (
          <SettingsRow
            key={row.field}
            first={i === 0}
            label={t(`settings.fields.${row.field}`)}
            value={row.value}
            onPress={() => edit(row.field)}
          />
        ))}
      </SettingsSection>

      <SettingsSection title={t('settings.legal')}>
        {LEGAL_KINDS.map((kind, i) => (
          <SettingsRow
            key={kind}
            first={i === 0}
            label={tc(`legal.${kind}`)}
            onPress={() => router.push(`/legal/${kind}`)}
          />
        ))}
      </SettingsSection>

      <View className="px-4 pt-8" style={{ paddingBottom: insets.bottom }}>
        <Button label={t('settings.signOut')} variant="danger" onPress={signOut} />
      </View>

      {profile ? (
        <BodyFieldSheet
          field={editing}
          visible={sheetOpen}
          session={session}
          profile={profile}
          onSave={save}
          onClose={() => setSheetOpen(false)}
        />
      ) : null}
    </Screen>
  );
}
