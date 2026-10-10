import { TopTabs } from 'expo-router/js-top-tabs';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTickets } from '@/features/support/data/tickets';
import { useUnreadCount } from '@/features/support/stores/seen-store';
import { TabHeader } from '@/shared/components/tab-header';
import { TopTabBar, type TopTabBarProps } from '@/shared/components/top-tab-bar';
import { colors } from '@/shared/lib/theme';

/**
 * Profile tab: the user (photo, about, activity, history) and their feedback to us as swipeable
 * top tabs. Unread team replies show as a count on "Feedback".
 */
export function ProfileLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { data: tickets = [] } = useTickets();
  const unread = useUnreadCount(tickets);
  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <TabHeader greeting={false} />
      <TopTabs
        tabBar={(props: TopTabBarProps) => (
          <TopTabBar {...props} className="mx-4 mt-3" badges={{ feedback: unread || undefined }} />
        )}
        screenOptions={{ sceneStyle: { backgroundColor: colors.bg } }}
      >
        <TopTabs.Screen name="index" options={{ title: t('profileTab.profile') }} />
        <TopTabs.Screen name="feedback" options={{ title: t('profileTab.feedback') }} />
      </TopTabs>
    </View>
  );
}
