import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useProfile } from '@/shared/data/profile';
import { useToday } from '@/shared/hooks/use-today';
import { formatDate } from '@/shared/lib/format';
import { IconButton } from '@/shared/ui/icon-button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { ProfileAvatar } from './profile-avatar';

export interface TabHeaderProps {
  /** Avatar, date and greeting on the left; the profile tab hides them (01b-2). */
  greeting?: boolean;
  /** Settings after search: only the profile tab, which the avatar on the others leads to. */
  settings?: boolean;
}

/**
 * Header shared by all tabs: avatar, today's date and greeting, then the weight history and
 * search (exercises and their records), always in the same place.
 */
export function TabHeader({ greeting = true, settings = false }: TabHeaderProps) {
  const { t } = useTranslation(['common', 'weight']);
  const { profile } = useProfile();
  // Changes at midnight (checked every minute and when the app returns). The React Compiler puts
  // the formatted date in the same memo block as `t()`, so a language switch re-renders it at once.
  const today = useToday();
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
              {formatDate(new Date(today), { weekday: 'long', day: 'numeric', month: 'short' })}
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
        <IconButton
          icon="scale"
          iconSize={19}
          accessibilityLabel={t('weight:open')}
          // The weight history; "+" there adds today's weigh-in.
          onPress={() => router.push('/body-weight')}
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
