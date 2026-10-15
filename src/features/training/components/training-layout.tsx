import { TopTabs } from 'expo-router/js-top-tabs';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SwipeTabs } from '@/shared/components/swipe-tabs';
import { TabHeader } from '@/shared/components/tab-header';
import { QueryFocus } from '@/shared/data/query-focus';

/**
 * Training tab: "Pläne" (the user's plans) and "Einzeltrainings" (their routines outside a plan)
 * as swipeable top tabs. New ones come from the tab bar's "+".
 */
export function TrainingLayout() {
  const { t } = useTranslation('training');
  const insets = useSafeAreaInsets();

  return (
    <QueryFocus>
      <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
        <TabHeader />
        <SwipeTabs>
          <TopTabs.Screen name="index" options={{ title: t('tabs.myPlan') }} />
          <TopTabs.Screen name="all" options={{ title: t('tabs.all') }} />
        </SwipeTabs>
      </View>
    </QueryFocus>
  );
}
