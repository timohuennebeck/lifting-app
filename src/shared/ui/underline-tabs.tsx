import { useState } from 'react';
import { Animated, View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';

import { PressableScale } from './pressable-scale';
import { Text } from './text';

export interface UnderlineTab<T extends string> {
  key: T;
  label: string;
}

export interface UnderlineTabsProps<T extends string> {
  tabs: UnderlineTab<T>[];
  value: T;
  onChange: (key: T) => void;
  /** The pager's position as a tab index (fractions while swiping); the underline follows it. */
  position: Animated.AnimatedInterpolation<number>;
  className?: string;
}

/** Equal-width text tabs on a hairline with an accent underline that follows the pager. */
export function UnderlineTabs<T extends string>({
  tabs,
  value,
  onChange,
  position,
  className,
}: UnderlineTabsProps<T>) {
  const [tabWidth, setTabWidth] = useState(0);
  const last = Math.max(1, tabs.length - 1);
  const translateX = position.interpolate({
    inputRange: [0, last],
    outputRange: [0, last * tabWidth],
    extrapolate: 'clamp',
  });

  return (
    <View
      className={cn('flex-row border-b border-control', className)}
      accessibilityRole="tablist"
      onLayout={(e) => setTabWidth(e.nativeEvent.layout.width / tabs.length)}
    >
      {tabs.map((tab) => (
        <PressableScale
          key={tab.key}
          haptic="select"
          accessibilityRole="tab"
          accessibilityState={{ selected: tab.key === value }}
          onPress={() => onChange(tab.key)}
          className="h-11.5 flex-1 items-center justify-center"
        >
          <Text variant="label" tone={tab.key === value ? 'default' : 'subtle'}>
            {tab.label}
          </Text>
        </PressableScale>
      ))}
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
