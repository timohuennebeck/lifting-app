import { type ReactNode, useState } from 'react';
import { View } from 'react-native';
import Animated, { type AnimatedRef } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { QueryFocus } from '@/shared/data/query-focus';

import { TabHeader } from './tab-header';

const TAB_BAR_PROBE = { position: 'absolute', left: 0, right: 0, bottom: 0 } as const;

/**
 * Measures what the tab bar and the home indicator cover at the bottom of a tab: an empty view
 * padded by its own bottom safe area. The tabs turn iOS's automatic scroll insets off, so each
 * tab keeps clear of the bar itself. Starts at the bottom safe area until measured.
 */
export function useTabBarInset() {
  const insets = useSafeAreaInsets();
  const [inset, setInset] = useState(insets.bottom);
  const probe = (
    <SafeAreaView
      edges={['bottom']}
      pointerEvents="none"
      style={TAB_BAR_PROBE}
      onLayout={(e) => setInset(e.nativeEvent.layout.height)}
    />
  );
  return [inset, probe] as const;
}

export interface TabScreenProps {
  children: ReactNode;
  /** Shows the avatar and greeting in the header (default true). */
  greeting?: boolean;
  /** Shows settings after search in the header (profile tab). */
  settings?: boolean;
  /** Rendered under the header, outside the scroll area. */
  pinned?: ReactNode;
  /** The scroll view, e.g. for a list dragged inside it to scroll it near its edges. */
  scrollRef?: AnimatedRef<Animated.ScrollView>;
  /** A page of a tab whose layout shows the header above its top tabs (Progress: Level, Body). */
  page?: boolean;
}

/**
 * Tab root: shared header plus a scroll view whose last rows clear the native tab bar (the
 * automatic scroll insets, off on every tab, also pushed content under the header out of view).
 * Queries rendered inside it pause while the tab is hidden (QueryFocus).
 */
export function TabScreen({
  children,
  greeting,
  settings,
  pinned,
  scrollRef,
  page = false,
}: TabScreenProps) {
  const insets = useSafeAreaInsets();
  const [tabBarInset, tabBarProbe] = useTabBarInset();
  return (
    <QueryFocus>
      <View className="flex-1 bg-bg" style={{ paddingTop: page ? 0 : insets.top }}>
        {page ? null : <TabHeader greeting={greeting} settings={settings} />}
        {pinned}
        <View className="flex-1">
          <Animated.ScrollView
            ref={scrollRef}
            contentInsetAdjustmentBehavior="never"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: tabBarInset + 24 }}
          >
            {children}
          </Animated.ScrollView>
          {tabBarProbe}
        </View>
      </View>
    </QueryFocus>
  );
}
