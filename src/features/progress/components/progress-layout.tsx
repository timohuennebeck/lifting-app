import { TopTabs } from 'expo-router/js-top-tabs';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNextCheck } from '@/features/body/hooks/use-next-check';
import { TabHeader } from '@/shared/components/tab-header';
import { TopTabBar, type TopTabBarProps } from '@/shared/components/top-tab-bar';
import { colors } from '@/shared/lib/theme';

/**
 * Progress tab: trained muscles and body checks as swipeable top tabs. Both stay mounted, so
 * switching never reloads (records are in the search).
 */
export function ProgressLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  // A due body check shows as a badge with 1 on "Körper".
  const { due } = useNextCheck();
  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <TabHeader />
      <TopTabs
        tabBar={(props: TopTabBarProps) => (
          <TopTabBar {...props} className="mx-4 mt-3" badges={{ body: due ? 1 : undefined }} />
        )}
        screenOptions={{ sceneStyle: { backgroundColor: colors.bg } }}
      >
        <TopTabs.Screen name="index" options={{ title: t('progressTab.muscles') }} />
        <TopTabs.Screen name="body" options={{ title: t('progressTab.body') }} />
      </TopTabs>
    </View>
  );
}
