import { TopTabs } from 'expo-router/js-top-tabs';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabHeader } from '@/shared/components/tab-header';
import { SwipeTabs } from '@/shared/components/swipe-tabs';

/**
 * Progress tab: trained muscles and body checks as swipeable top tabs. Both stay mounted, so
 * switching never reloads (records are in the search).
 */
export function ProgressLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <TabHeader />
      <SwipeTabs>
        <TopTabs.Screen name="index" options={{ title: t('progressTab.muscles') }} />
        <TopTabs.Screen name="body" options={{ title: t('progressTab.body') }} />
      </SwipeTabs>
    </View>
  );
}
