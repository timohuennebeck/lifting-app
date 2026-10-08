import { Image } from 'expo-image';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useOnboardingStore } from '@/features/onboarding/stores/onboarding-store';
import { type ProfilePatch, saveProfile, useProfile } from '@/shared/data/profile';
import { supabase } from '@/shared/data/supabase';
import { APP_LANGUAGES, type AppLanguage } from '@/shared/i18n/resources';
import { cn } from '@/shared/lib/cn';
import { formatWeight, type UnitSystem } from '@/shared/lib/format';
import { haptics } from '@/shared/lib/haptics';
import { colors } from '@/shared/lib/theme';
import { requireUserId } from '@/shared/stores/session-store';
import { ACCENT_OPTIONS, useSettingsStore } from '@/shared/stores/settings-store';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { IconButton } from '@/shared/ui/icon-button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Screen } from '@/shared/ui/screen';
import { SegmentedControl } from '@/shared/ui/segmented-control';
import { Text } from '@/shared/ui/text';

import { type BodyField, BodyFieldSheet } from '../components/body-field-sheet';
import { SettingsRow, SettingsSection } from '../components/settings-section';
import { formatHeight } from '../lib/body-units';

const FLAGS: Record<AppLanguage, number> = {
  en: require('@/assets/images/flags/en.svg'),
  de: require('@/assets/images/flags/de.svg'),
  'pt-PT': require('@/assets/images/flags/pt-PT.svg'),
  'pt-BR': require('@/assets/images/flags/pt-BR.svg'),
};

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

  const signOut = () =>
    Alert.alert(t('settings.signOutConfirm.title'), t('settings.signOutConfirm.body'), [
      { text: tc('actions.cancel'), style: 'cancel' },
      {
        text: t('settings.signOut'),
        style: 'destructive',
        onPress: async () => {
          haptics.warning();
          await supabase.auth.signOut();
          useOnboardingStore.getState().reset();
        },
      },
    ]);

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
        <View className="flex-row items-center gap-3 px-4 pt-2.5 pb-1.5">
          <IconButton
            icon="chevron-left"
            iconSize={9}
            accessibilityLabel={tc('actions.back')}
            onPress={() => router.back()}
          />
          <Text variant="headline">{tc('settings')}</Text>
        </View>
      }
    >
      <Stack.Screen options={{ animation: 'slide_from_right', gestureEnabled: true }} />

      <SettingsSection title={t('settings.language')}>
        {APP_LANGUAGES.map((lang, i) => (
          <SettingsRow
            key={lang}
            first={i === 0}
            label={tc(`languages.${lang}`)}
            accessibilityRole="radio"
            selected={lang === language}
            leading={<Image source={FLAGS[lang]} style={{ width: 28, height: 28 }} />}
            trailing={
              lang === language ? (
                <View className="size-6 items-center justify-center rounded-full bg-accent">
                  <Icon name="check" size={12} color={colors.onAccent} />
                </View>
              ) : (
                <View className="size-6 rounded-full border-[1.5px] border-[#4A4A46]" />
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
                className="size-[34px] items-center justify-center rounded-full"
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
