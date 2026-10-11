import { type ReactNode, useEffect, useRef } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  ScrollView,
  View,
} from 'react-native';

import { cn } from '@/shared/lib/cn';
import { haptics } from '@/shared/lib/haptics';
import { clamp } from '@/shared/lib/math';

import { Gradient, type GradientStop } from './gradient';
import { Text } from './text';

// Row height and five visible rows, as on the iOS wheels; the selected row is the middle one.
const ROW = 44;
const PAD = ROW * 2;
/** Rows fade out towards the top and bottom; the middle row stays clear. */
const EDGE_FADE: GradientStop[] = [
  [0, 0.92],
  [0.38, 0],
  [0.62, 0],
  [1, 0.92],
];
// React Native Web ignores snapToInterval; CSS scroll snapping does the same there.
const WEB_SNAP = Platform.OS === 'web' ? ({ scrollSnapType: 'y mandatory' } as object) : null;
const WEB_SNAP_ROW = Platform.OS === 'web' ? ({ scrollSnapAlign: 'center' } as object) : null;

export interface WheelGroupProps {
  /** The wheels, side by side. */
  children: ReactNode;
  className?: string;
}

/** Frame for one or more wheels: one band behind the selected row and fading edges. */
export function WheelGroup({ children, className }: WheelGroupProps) {
  return (
    <View className={cn('h-55 flex-row', className)}>
      <View className="absolute inset-x-0 top-22 h-11 rounded-xl bg-elevated" />
      {children}
      <Gradient from="top" stops={EDGE_FADE} />
    </View>
  );
}

export interface WheelPickerProps {
  items: readonly string[];
  /** Index of the selected item. */
  index: number;
  onChange: (index: number) => void;
  /** Read out with the value, e.g. "Day". */
  accessibilityLabel: string;
  className?: string;
}

/**
 * One wheel of a picker, inside a WheelGroup: snaps row by row and ticks as the selected item
 * changes. Screen readers adjust it with swipes up and down.
 */
export function WheelPicker({
  items,
  index,
  onChange,
  accessibilityLabel,
  className,
}: WheelPickerProps) {
  const scrollRef = useRef<ScrollView>(null);
  // The row at the centre; scrolling there in code (without animation) changes nothing.
  const shown = useRef(index);

  // Follow changes from outside, e.g. the day clamped to a shorter month.
  useEffect(() => {
    if (index === shown.current) return;
    shown.current = index;
    scrollRef.current?.scrollTo({ y: index * ROW, animated: false });
  }, [index]);

  const select = (next: number) => {
    if (next === shown.current) return;
    shown.current = next;
    haptics.select();
    onChange(next);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    select(clamp(Math.round(e.nativeEvent.contentOffset.y / ROW), 0, items.length - 1));

  const step = (by: number) => {
    const next = clamp(shown.current + by, 0, items.length - 1);
    scrollRef.current?.scrollTo({ y: next * ROW, animated: false });
    select(next);
  };

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: items[index] }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => step(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
      className={cn('h-full', className)}
    >
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ROW}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={onScroll}
        onLayout={() =>
          requestAnimationFrame(() =>
            scrollRef.current?.scrollTo({ y: shown.current * ROW, animated: false }),
          )
        }
        style={WEB_SNAP}
        contentContainerStyle={{ paddingVertical: PAD }}
      >
        {items.map((item, i) => (
          <View key={item} style={WEB_SNAP_ROW} className="h-11 items-center justify-center">
            <Text
              tone={i === index ? 'default' : 'subtle'}
              className="font-inter-medium text-[22px] leading-7 tabular-nums"
            >
              {item}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
