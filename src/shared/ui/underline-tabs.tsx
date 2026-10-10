import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/shared/lib/cn';

import { PressableScale } from './pressable-scale';
import { Text } from './text';

export interface UnderlineTab<T extends string> {
  key: T;
  label: string;
  /** A small accent dot after the label: something there wants attention. */
  dot?: boolean;
}

export interface UnderlineTabsProps<T extends string> {
  tabs: UnderlineTab<T>[];
  value: T;
  onChange: (key: T) => void;
  /** Index of a pager the underline follows while swiping (fractions in between). */
  position?: SharedValue<number>;
  className?: string;
}

/** Equal-width text tabs on a hairline with an accent underline (exercise page, Progress tab). */
export function UnderlineTabs<T extends string>({
  tabs,
  value,
  onChange,
  position,
  className,
}: UnderlineTabsProps<T>) {
  const selected = Math.max(
    0,
    tabs.findIndex((tab) => tab.key === value),
  );
  const tabWidth = useSharedValue(0);
  // Without a pager the underline slides to the tapped tab.
  const slide = useSharedValue(selected);
  useEffect(() => {
    slide.set(withTiming(selected, { duration: 220 }));
  }, [selected, slide]);
  const underline = useAnimatedStyle(() => ({
    width: tabWidth.get(),
    transform: [{ translateX: (position ? position.get() : slide.get()) * tabWidth.get() }],
  }));

  return (
    <View
      className={cn('flex-row border-b border-control', className)}
      accessibilityRole="tablist"
      onLayout={(e) => tabWidth.set(e.nativeEvent.layout.width / tabs.length)}
    >
      {tabs.map((tab) => (
        <PressableScale
          key={tab.key}
          haptic="select"
          accessibilityRole="tab"
          accessibilityState={{ selected: tab.key === value }}
          onPress={() => onChange(tab.key)}
          className="h-11.5 flex-1 flex-row items-center justify-center gap-1.5"
        >
          <Text variant="label" tone={tab.key === value ? 'default' : 'subtle'}>
            {tab.label}
          </Text>
          {tab.dot ? <View className="size-1.75 rounded-full bg-accent" /> : null}
        </PressableScale>
      ))}
      <Animated.View
        pointerEvents="none"
        className="absolute -bottom-px left-0 h-0.5 bg-accent"
        style={underline}
      />
    </View>
  );
}
