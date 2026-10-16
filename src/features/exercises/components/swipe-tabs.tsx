import { TopTabs } from 'expo-router/js-top-tabs';
import { type ReactNode, useState } from 'react';
import { Animated, View } from 'react-native';

import { colors } from '@/shared/lib/theme';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

interface TabRoute {
  key: string;
  name: string;
}

/** What the material top tabs hand their tab bar (typed loosely by the navigator). */
export interface TopTabBarProps {
  state: { index: number; routes: TabRoute[] };
  navigation: {
    emit: (event: { type: 'tabPress'; target: string; canPreventDefault: true }) => {
      defaultPrevented: boolean;
    };
  };
  descriptors: Record<string, { options: { title?: string } } | undefined>;
  /** The pager's position as a tab index (fractions while swiping); the underline follows it. */
  position: Animated.AnimatedInterpolation<number>;
  /** Moves the pager to a route and updates the state with it. */
  jumpTo: (key: string) => void;
}

/**
 * The tab bar in the app's look: equal-width titles from the screens' options on a hairline, with
 * an accent underline that follows the swipe.
 */
function TopTabBar({ state, navigation, descriptors, position, jumpTo }: TopTabBarProps) {
  const [tabWidth, setTabWidth] = useState(0);
  const { routes } = state;
  const last = Math.max(1, routes.length - 1);
  const translateX = position.interpolate({
    inputRange: [0, last],
    outputRange: [0, last * tabWidth],
    extrapolate: 'clamp',
  });

  const press = (route: TabRoute, focused: boolean) => {
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    // Not navigate(): that only moves the pager when its own idea of the page differs, and
    // after a tap iOS doesn't always tell it, so a later tap back left the page in place.
    if (!focused && !event.defaultPrevented) jumpTo(route.key);
  };

  return (
    <View
      className="mx-4 mt-3 flex-row border-b border-control"
      accessibilityRole="tablist"
      onLayout={(e) => setTabWidth(e.nativeEvent.layout.width / routes.length)}
    >
      {routes.map((route, i) => {
        const focused = i === state.index;
        return (
          <PressableScale
            key={route.key}
            haptic="select"
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            onPress={() => press(route, focused)}
            className="h-11.5 flex-1 items-center justify-center"
          >
            <Text variant="label" tone={focused ? 'default' : 'subtle'}>
              {descriptors[route.key]?.options.title ?? route.name}
            </Text>
          </PressableScale>
        );
      })}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: -1,
          left: 0,
          height: 2,
          width: tabWidth,
          backgroundColor: colors.accent,
          transform: [{ translateX }],
        }}
      />
    </View>
  );
}

const SCREEN_OPTIONS = { sceneStyle: { backgroundColor: colors.bg } };

export interface SwipeTabsProps {
  /** The tabs as `TopTabs.Screen`s. */
  children: ReactNode;
}

/** The swipeable top tabs (exercise page) with the app's tab bar and page color. */
export function SwipeTabs({ children }: SwipeTabsProps) {
  return (
    <TopTabs
      tabBar={(props: TopTabBarProps) => <TopTabBar {...props} />}
      screenOptions={SCREEN_OPTIONS}
    >
      {children}
    </TopTabs>
  );
}
