import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useProfile } from '@/shared/data/profile';
import { useNow } from '@/shared/hooks/use-now';
import { MINUTE_MS } from '@/shared/lib/date';
import { formatDate } from '@/shared/lib/format';
import { Avatar } from '@/shared/ui/avatar';
import { IconButton } from '@/shared/ui/icon-button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

export interface TabHeaderProps {
  /** Extra round buttons placed before the settings button. */
  actions?: ReactNode;
  /** Avatar, date and greeting on the left; the profile tab hides them (01b-2). */
  greeting?: boolean;
}

/** Header shared by all tabs: avatar, today's date, greeting, optional actions and settings. */
export function TabHeader({ actions, greeting = true }: TabHeaderProps) {
  const { t } = useTranslation();
  const { profile } = useProfile();
  // Ticks every minute so the date turns over at midnight.
  const now = useNow(MINUTE_MS, greeting);
  const name = profile?.firstName ?? '';
  return (
    <View className="flex-row items-center justify-between gap-3 px-5 pt-2.5 pb-1.5">
      {greeting ? (
        <PressableScale
          className="min-w-0 flex-1 flex-row items-center gap-3"
          accessibilityLabel={t('tabs.profile')}
          onPress={() => router.navigate('/profile')}
        >
          <Avatar name={name} />
          <View className="min-w-0 flex-1 gap-0.5">
            <Text variant="caption" tone="subtle" numberOfLines={1}>
              {formatDate(new Date(now), { weekday: 'long', day: 'numeric', month: 'short' })}
            </Text>
            <Text variant="bodyStrong" numberOfLines={1}>
              {t('greeting', { name })}
            </Text>
          </View>
        </PressableScale>
      ) : (
        <View className="flex-1" />
      )}
      <View className="flex-row gap-2">
        {actions}
        <IconButton
          icon="settings"
          iconSize={20}
          accessibilityLabel={t('settings')}
          onPress={() => router.navigate('/settings')}
        />
      </View>
    </View>
  );
}
