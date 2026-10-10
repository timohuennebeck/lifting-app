import { router } from 'expo-router';
import { TopTabs } from 'expo-router/js-top-tabs';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTickets } from '@/features/support/data/tickets';
import { useUnreadCount } from '@/features/support/stores/seen-store';
import { TabHeader } from '@/shared/components/tab-header';
import { TopTabBar, type TopTabBarProps } from '@/shared/components/top-tab-bar';
import { colors } from '@/shared/lib/theme';
import { IconButton } from '@/shared/ui/icon-button';

import { ProfileHeader } from './profile-header';

/**
 * Profile tab: the user's photo, name and about stay on top; below them "Profil" (activity,
 * history) and "Feedback" (tickets) swipe like Fortschritt. Unread team replies show as a count
 * on "Feedback"; the speech bubble in the header opens the full tickets page.
 */
export function ProfileLayout() {
  const { t } = useTranslation(['common', 'support']);
  const insets = useSafeAreaInsets();
  const { data: tickets = [] } = useTickets();
  const unread = useUnreadCount(tickets);
  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <TabHeader
        greeting={false}
        actions={
          <IconButton
            icon="chat"
            iconSize={17}
            accessibilityLabel={t('support:feedback.allTickets')}
            onPress={() => router.push('/support')}
          />
        }
      />
      <ProfileHeader />
      <TopTabs
        tabBar={(props: TopTabBarProps) => (
          <TopTabBar {...props} className="mx-4 mt-5" badges={{ feedback: unread || undefined }} />
        )}
        screenOptions={{ sceneStyle: { backgroundColor: colors.bg } }}
      >
        <TopTabs.Screen name="index" options={{ title: t('profileTab.profile') }} />
        <TopTabs.Screen name="feedback" options={{ title: t('profileTab.feedback') }} />
      </TopTabs>
    </View>
  );
}
