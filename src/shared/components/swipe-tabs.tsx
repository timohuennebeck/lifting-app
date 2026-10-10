import { TopTabs } from 'expo-router/js-top-tabs';
import type { ReactNode } from 'react';
import type { Animated } from 'react-native';

import { colors } from '@/shared/lib/theme';
import { UnderlineTabs } from '@/shared/ui/underline-tabs';

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
  position: Animated.AnimatedInterpolation<number>;
  /** Moves the pager to a route and updates the state with it. */
  jumpTo: (key: string) => void;
}

/**
 * The tab bar in the app's look: titles from the screens' options, an underline that follows the
 * swipe.
 */
function TopTabBar({ state, navigation, descriptors, position, jumpTo }: TopTabBarProps) {
  const focused = state.routes[state.index]?.name ?? '';
  return (
    <UnderlineTabs
      className="mx-4 mt-3"
      position={position}
      value={focused}
      tabs={state.routes.map((route) => ({
        key: route.name,
        label: descriptors[route.key]?.options.title ?? route.name,
      }))}
      onChange={(name) => {
        const route = state.routes.find((r) => r.name === name);
        if (!route) return;
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });
        // Not navigate(): that only moves the pager when its own idea of the page differs, and
        // after a tap iOS doesn't always tell it, so a later tap back left the page in place.
        if (name !== focused && !event.defaultPrevented) jumpTo(route.key);
      }}
    />
  );
}

const SCREEN_OPTIONS = { sceneStyle: { backgroundColor: colors.bg } };

export interface SwipeTabsProps {
  /** The tabs as `TopTabs.Screen`s. */
  children: ReactNode;
}

/** The swipeable top tabs (Progress tab, exercise page) with the app's tab bar and page color. */
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
