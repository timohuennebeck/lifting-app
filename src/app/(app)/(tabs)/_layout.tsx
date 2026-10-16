import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { CreateAnythingSheet } from '@/features/training/components/create-anything-sheet';
import { colors } from '@/shared/lib/theme';

/**
 * iOS 26 draws the "search" item apart from the bar, on the right; earlier iOS would label it
 * "Search", so there "+" is a plain last item, as on Android.
 */
const DETACHED = Platform.OS === 'ios' && Number.parseInt(String(Platform.Version), 10) >= 26;

export default function TabsLayout() {
  const { t } = useTranslation();
  const [createOpen, setCreateOpen] = useState(false);
  return (
    <>
      {/* Automatic scroll insets are off on every tab: iOS treated each tab's scroll view, which
          starts under our header, as reaching the top of the screen and hid its first part. The
          screens keep clear of the tab bar themselves (TabBarInset). */}
      <NativeTabs tintColor={colors.accent} backgroundColor={colors.bg} iconColor={colors.subtle}>
        <NativeTabs.Trigger name="index" disableAutomaticContentInsets>
          <NativeTabs.Trigger.Label>{t('tabs.training')}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="dumbbell.fill" md="fitness_center" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="level" disableAutomaticContentInsets>
          <NativeTabs.Trigger.Label>{t('progressTab.muscles')}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: 'chart.bar', selected: 'chart.bar.fill' }}
            md="leaderboard"
          />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="body" disableAutomaticContentInsets>
          <NativeTabs.Trigger.Label>{t('progressTab.body')}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="figure.stand" md="accessibility_new" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile" disableAutomaticContentInsets>
          <NativeTabs.Trigger.Label>{t('tabs.profile')}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }}
            md="account_circle"
          />
        </NativeTabs.Trigger>
        {/* Not a tab: it can't be selected, a tap opens the "+" sheet. */}
        <NativeTabs.Trigger
          name="create"
          role={DETACHED ? 'search' : undefined}
          disabled
          listeners={{ tabPress: () => setCreateOpen(true) }}
        >
          <NativeTabs.Trigger.Label>{t('tabs.create')}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="plus" md="add" />
        </NativeTabs.Trigger>
      </NativeTabs>
      <CreateAnythingSheet visible={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
