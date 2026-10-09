import { useEffect, useRef, useState } from 'react';
import {
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  View,
} from 'react-native';

import { cn } from '@/shared/lib/cn';
import { haptics } from '@/shared/lib/haptics';
import { clamp } from '@/shared/lib/math';
import { colors, useAccentColor } from '@/shared/lib/theme';

import { DotPattern } from './dot-pattern';
import { Gradient, type GradientStop } from './gradient';

const TICK = 5;
// Wide enough that a flick doesn't race through dozens of values.
const GAP = 11;
const PITCH = TICK + GAP;
// Dot colors of the design's tick columns.
const TICK_MAJOR = '#B5B5AF';
const TICK_MINOR = colors.outline;
/** Ticks fade out towards both ends. */
const EDGE_FADE: GradientStop[] = [
  [0, 1],
  [0.3, 0],
  [0.7, 0],
  [1, 1],
];

export interface RulerPickerProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  /** Every n-th tick is drawn as a major tick. */
  majorEvery?: number;
  /** Every n-th tick is drawn as a medium tick. */
  midEvery?: number;
  vertical?: boolean;
  className?: string;
}

/** Scrollable tick scale with a centered accent marker (Weight, Height). */
export function RulerPicker({
  value,
  onChange,
  min,
  max,
  step,
  majorEvery = 10,
  midEvery = 2,
  vertical,
  className,
}: RulerPickerProps) {
  const accent = useAccentColor();
  const scrollRef = useRef<ScrollView>(null);
  const [extent, setExtent] = useState(0);
  const lastIndex = useRef(Math.round((value - min) / step));
  // Only user drags change the value; programmatic scrolls must not.
  const dragging = useRef(false);
  const count = Math.round((max - min) / step) + 1;
  const pad = extent / 2 - TICK / 2;

  // Follow external value changes (e.g. −/+ buttons) without fighting user drags.
  useEffect(() => {
    const index = Math.round((value - min) / step);
    if (!extent || index === lastIndex.current) return;
    lastIndex.current = index;
    const offset = index * PITCH;
    scrollRef.current?.scrollTo(vertical ? { y: offset } : { x: offset });
  }, [value, min, step, extent, vertical]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!dragging.current) return;
    const offset = vertical ? e.nativeEvent.contentOffset.y : e.nativeEvent.contentOffset.x;
    const index = clamp(Math.round(offset / PITCH), 0, count - 1);
    if (index === lastIndex.current) return;
    lastIndex.current = index;
    haptics.select();
    onChange(+(min + index * step).toFixed(2));
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const size = vertical ? e.nativeEvent.layout.height : e.nativeEvent.layout.width;
    setExtent(size);
    const offset = lastIndex.current * PITCH;
    requestAnimationFrame(() =>
      scrollRef.current?.scrollTo({ [vertical ? 'y' : 'x']: offset, animated: false }),
    );
  };

  const length = (i: number) => (i % majorEvery === 0 ? 64 : i % midEvery === 0 ? 44 : 24);

  return (
    <View className={cn(vertical ? 'w-27.5' : 'h-25 w-full', className)} onLayout={onLayout}>
      <ScrollView
        ref={scrollRef}
        horizontal={!vertical}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        snapToInterval={PITCH}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={onScroll}
        onScrollBeginDrag={() => (dragging.current = true)}
        onMomentumScrollEnd={() => (dragging.current = false)}
        contentContainerStyle={
          vertical ? { paddingVertical: pad } : { paddingHorizontal: pad, alignItems: 'flex-end' }
        }
      >
        {Array.from({ length: count }, (_, i) => (
          <DotPattern
            key={i}
            color={i % majorEvery === 0 ? TICK_MAJOR : TICK_MINOR}
            style={
              vertical
                ? { height: TICK, marginBottom: GAP, width: length(i) }
                : { width: TICK, marginRight: GAP, height: length(i) }
            }
            className="self-end"
          />
        ))}
      </ScrollView>
      <DotPattern
        pointerEvents="none"
        color={accent}
        radius={1.5}
        className="absolute"
        style={[
          vertical
            ? { right: 0, top: extent / 2 - TICK / 2, height: TICK, width: 96 }
            : { bottom: 0, left: extent / 2 - TICK / 2, width: TICK, height: 96 },
        ]}
      />
      <Gradient from={vertical ? 'top' : 'left'} stops={EDGE_FADE} />
    </View>
  );
}
