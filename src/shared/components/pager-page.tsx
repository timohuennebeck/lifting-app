import { type ReactNode, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabBarInset } from './tab-bar-inset';

/**
 * One page of a tab with swipeable top tabs (Fortschritt): scrolls on its own and keeps its last
 * rows clear of the native tab bar.
 */
export function PagerPage({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [tabBarInset, setTabBarInset] = useState(insets.bottom);
  return (
    <View className="flex-1">
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: tabBarInset + 24 }}
      >
        {children}
      </ScrollView>
      <TabBarInset onChange={setTabBarInset} />
    </View>
  );
}
