import { type ReactNode, useState } from 'react';
import { View } from 'react-native';
import Animated, { type AnimatedRef } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomFade } from '@/shared/ui/bottom-fade';

import { TabBarInset } from './tab-bar-inset';
import { TabHeader } from './tab-header';

export interface TabScreenProps {
  children: ReactNode;
  /** Extra header buttons, placed before settings. */
  headerActions?: ReactNode;
  /** Shows the avatar and greeting in the header (default true). */
  greeting?: boolean;
  /** Rendered under the header, outside the scroll area. */
  pinned?: ReactNode;
  /** Sticky CTA over the content's bottom edge (01·K·B). */
  footer?: ReactNode;
  /** For drag and drop lists that scroll the page while dragging. */
  scrollRef?: AnimatedRef<Animated.ScrollView>;
  /** Children (by index) that stick under the header once scrolled to, e.g. tabs. */
  stickyHeaderIndices?: number[];
}

const FOOTER_SPACE = 110;
const FOOTER_STYLE = { position: 'absolute', left: 0, right: 0, bottom: 0 } as const;

/** Tab root: shared header plus a scroll view that clears the native tab bar. */
export function TabScreen({
  children,
  headerActions,
  greeting,
  pinned,
  footer,
  scrollRef,
  stickyHeaderIndices,
}: TabScreenProps) {
  const insets = useSafeAreaInsets();
  const [tabBarInset, setTabBarInset] = useState(insets.bottom);
  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <TabHeader actions={headerActions} greeting={greeting} />
      {pinned}
      <Animated.ScrollView
        ref={scrollRef}
        stickyHeaderIndices={stickyHeaderIndices}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: tabBarInset + (footer ? FOOTER_SPACE : 24),
        }}
      >
        {children}
      </Animated.ScrollView>
      <TabBarInset onChange={setTabBarInset} />
      {footer ? (
        // The view's own safe area includes the native tab bar, so the CTA sits above it.
        <SafeAreaView edges={['bottom']} pointerEvents="box-none" style={FOOTER_STYLE}>
          <BottomFade className="relative" bottomInset={12}>
            {footer}
          </BottomFade>
        </SafeAreaView>
      ) : null}
    </View>
  );
}
