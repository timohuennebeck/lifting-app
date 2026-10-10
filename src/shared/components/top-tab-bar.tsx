import type { Animated } from 'react-native';

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
    navigate: (name: string) => void;
  };
  descriptors: Record<string, { options: { title?: string } } | undefined>;
  position: Animated.AnimatedInterpolation<number>;
  /** Counts shown next to tab titles, by route name. */
  badges?: Record<string, number | undefined>;
  className?: string;
}

/**
 * The bar of the swipeable top tabs (Progress tab, exercise page) in the app's look: titles from
 * the screens' options, an underline that follows the swipe.
 */
export function TopTabBar({
  state,
  navigation,
  descriptors,
  position,
  badges,
  className,
}: TopTabBarProps) {
  const focused = state.routes[state.index]?.name ?? '';
  return (
    <UnderlineTabs
      className={className}
      position={position}
      value={focused}
      tabs={state.routes.map((route) => ({
        key: route.name,
        label: descriptors[route.key]?.options.title ?? route.name,
        badge: badges?.[route.name],
      }))}
      onChange={(name) => {
        const route = state.routes.find((r) => r.name === name);
        if (!route) return;
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });
        if (name !== focused && !event.defaultPrevented) navigation.navigate(route.name);
      }}
    />
  );
}
