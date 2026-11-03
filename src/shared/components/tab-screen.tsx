import { useIsFocused } from 'expo-router';
import type { ReactNode, Ref } from 'react';
import { View } from 'react-native';
import {
  KeyboardAwareScrollView,
  type KeyboardAwareScrollViewRef,
} from 'react-native-keyboard-controller';
import type Animated from 'react-native-reanimated';
import type { AnimatedRef } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTabBarStore } from '@/shared/stores/tab-bar-store';

import { TabHeader } from './tab-header';

const TAB_BAR_PROBE = { position: 'absolute', left: 0, right: 0, bottom: 0 } as const;

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
}

/**
 * Tab root: shared header plus a scroll view whose last rows clear the native tab bar. The tabs
 * turn iOS's automatic scroll insets off (they also pushed content under the header out of
 * view), so an empty view padded by its own bottom safe area measures what the tab bar and the
 * home indicator cover, and the scroll view pads for that. Only a shown tab can measure it, so
 * every tab uses the same stored value: nothing moves when one is shown for the first time.
 */
export function TabScreen({ children, greeting, settings, pinned, scrollRef }: TabScreenProps) {
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
  const measured = useTabBarStore((s) => s.inset);
  const tabBarInset = measured ?? insets.bottom;
  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <TabHeader greeting={greeting} settings={settings} />
      {pinned}
      <View className="flex-1">
        {/* A field on the page (Kai's card) stays above the keyboard and taps reach its buttons. */}
        <KeyboardAwareScrollView
          // Its ref is the scroll view itself, with one method added.
          ref={scrollRef as unknown as Ref<KeyboardAwareScrollViewRef>}
          bottomOffset={12}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentInsetAdjustmentBehavior="never"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: tabBarInset + 24 }}
        >
          {children}
        </KeyboardAwareScrollView>
        <SafeAreaView
          edges={['bottom']}
          pointerEvents="none"
          style={TAB_BAR_PROBE}
          onLayout={(e) => {
            const { height } = e.nativeEvent.layout;
            if (focused && height > 0) useTabBarStore.setState({ inset: height });
          }}
        />
      </View>
    </View>
  );
}
