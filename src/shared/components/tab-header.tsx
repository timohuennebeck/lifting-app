import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useProfile } from '@/shared/data/profile';
import { useNow } from '@/shared/hooks/use-now';
import { MINUTE_MS, toIsoDate } from '@/shared/lib/date';
import { formatDate } from '@/shared/lib/format';
import { IconButton } from '@/shared/ui/icon-button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { ProfileAvatar } from './user-avatar';

export interface TabHeaderProps {
  /** Extra round buttons placed before the calendar, weight and search. */
  actions?: ReactNode;
  /** Avatar, date and greeting on the left; the profile tab hides them (01b-2). */
  greeting?: boolean;
  /** Settings after search: only the profile tab, which the avatar on the others leads to. */
  settings?: boolean;
}

/**
 * Header shared by all tabs: avatar, today's date, greeting, optional actions, then the weight
 * calendar, today's weigh-in and search (exercises and their records), always in the same place.
 */
export function TabHeader({ actions, greeting = true, settings = false }: TabHeaderProps) {
  const { t } = useTranslation(['common', 'weight']);
  const { profile } = useProfile();
  // Ticks every minute so the date (also the one in the calendar icon) turns over at midnight.
  const now = useNow(MINUTE_MS);
  const name = profile?.firstName ?? '';
  return (
    <View className="flex-row items-center justify-between gap-3 px-5 pt-2.5 pb-1.5">
      {greeting ? (
        <PressableScale
          className="min-w-0 flex-1 flex-row items-center gap-3"
          accessibilityLabel={t('tabs.profile')}
          onPress={() => router.navigate('/profile')}
        >
          <ProfileAvatar profile={profile} />
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
          // A new day draws the icon again, with its date.
          key={toIsoDate(new Date(now))}
          icon="calendar"
          iconSize={19}
          accessibilityLabel={t('weight:history.calendar')}
          onPress={() => router.push('/body-weight/calendar')}
        />
        <IconButton
          icon="scale"
          iconSize={19}
          accessibilityLabel={t('weight:open')}
          // Straight to today's weigh-in; its "Historie" button leads on to the history.
          onPress={() =>
            router.push({
              pathname: '/body-weight/[date]',
              params: { date: toIsoDate(new Date()) },
            })
          }
        />
        <IconButton
          icon="search"
          iconSize={17}
          accessibilityLabel={t('search.open')}
          onPress={() => router.push('/search')}
        />
        {settings ? (
          <IconButton
            icon="settings"
            iconSize={20}
            accessibilityLabel={t('settings')}
            onPress={() => router.navigate('/settings')}
          />
        ) : null}
      </View>
    </View>
  );
}
