import { type ReactNode, useState } from 'react';
import { View } from 'react-native';
import Animated, { type AnimatedRef } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabBarInset } from './tab-bar-inset';

export interface PagerPageProps {
  children: ReactNode;
  scrollRef?: AnimatedRef<Animated.ScrollView>;
}

/**
 * Scrolling body of a tab, below TabScreen's header or as one page of the swipeable top tabs
 * (Fortschritt): keeps its last rows clear of the native tab bar.
 */
export function PagerPage({ children, scrollRef }: PagerPageProps) {
  const insets = useSafeAreaInsets();
  const [tabBarInset, setTabBarInset] = useState(insets.bottom);
  return (
    <View className="flex-1">
      <Animated.ScrollView
        ref={scrollRef}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: tabBarInset + 24 }}
      >
        {children}
      </Animated.ScrollView>
      <TabBarInset onChange={setTabBarInset} />
    </View>
  );
}
