import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTranslation } from 'react-i18next';

import { colors, useAccentColor } from '@/shared/lib/theme';

export default function TabsLayout() {
  const { t } = useTranslation();
  const accent = useAccentColor();
  return (
    <NativeTabs tintColor={accent} backgroundColor={colors.bg} iconColor={colors.subtle}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{t('tabs.today')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'sun.max', selected: 'sun.max.fill' }} md="today" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="training">
        <NativeTabs.Trigger.Label>{t('tabs.training')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="dumbbell.fill" md="fitness_center" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="muscles">
        <NativeTabs.Trigger.Label>{t('tabs.muscles')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="figure.strengthtraining.traditional" md="accessibility_new" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="body">
        <NativeTabs.Trigger.Label>{t('tabs.body')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="figure.stand" md="person" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>{t('tabs.profile')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }}
          md="account_circle"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
