import type { ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { type AnimatedRef } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PagerPage } from './pager-page';
import { TabHeader } from './tab-header';

export interface TabScreenProps {
  children: ReactNode;
  /** Extra header buttons, placed before search and settings. */
  headerActions?: ReactNode;
  /** Shows the avatar and greeting in the header (default true). */
  greeting?: boolean;
  /** Rendered under the header, outside the scroll area. */
  pinned?: ReactNode;
  /** For drag and drop lists that scroll the page while dragging. */
  scrollRef?: AnimatedRef<Animated.ScrollView>;
}

/** Tab root: shared header plus a scroll view that clears the native tab bar. */
export function TabScreen({
  children,
  headerActions,
  greeting,
  pinned,
  scrollRef,
}: TabScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <TabHeader actions={headerActions} greeting={greeting} />
      {pinned}
      <PagerPage scrollRef={scrollRef}>{children}</PagerPage>
    </View>
  );
}
