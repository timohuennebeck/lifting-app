import { TopTabs } from 'expo-router/js-top-tabs';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SwipeTabs } from '@/shared/components/swipe-tabs';
import { TabHeader } from '@/shared/components/tab-header';

/** The Progress tab: the shared header over Level and Body, swiped between like an exercise's tabs. */
export default function ProgressLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <TabHeader />
      <SwipeTabs>
        <TopTabs.Screen name="index" options={{ title: t('tabs.level') }} />
        <TopTabs.Screen name="body" options={{ title: t('tabs.body') }} />
      </SwipeTabs>
    </View>
  );
}
