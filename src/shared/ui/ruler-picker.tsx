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
import { colors } from '@/shared/lib/theme';

import { DotPattern } from './dot-pattern';
import { Gradient, type GradientStop } from './gradient';
import { Text } from './text';

/** Tick geometry per look: dotted columns (onboarding) or thin lines with numbers (weight). */
const LOOKS = {
  // Wide enough that a flick doesn't race through dozens of values.
  dots: { tick: 5, gap: 11 },
  lines: { tick: 2, gap: 8 },
} as const;
// Dot colors of the design's tick columns.
const TICK_MAJOR = '#B5B5AF';
const TICK_MINOR = colors.outline;
/** Ticks fade out towards both ends; the lines evenly from the middle (GW·1). */
const EDGE_FADE: Record<keyof typeof LOOKS, GradientStop[]> = {
  dots: [
    [0, 1],
    [0.3, 0],
    [0.7, 0],
    [1, 1],
  ],
  lines: [
    [0, 0.9],
    [0.5, 0],
    [1, 0.9],
  ],
};
/** Lines look: tick lengths, and the marker's overhang above and below the longest tick. */
const LINE_LENGTH = { major: 40, mid: 28, minor: 18 } as const;
const MARKER_OVERHANG = 8;

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
  /** Dotted columns, or thin lines with `label` under every major tick (horizontal only). */
  look?: keyof typeof LOOKS;
  label?: (value: number) => string;
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
  look = 'dots',
  label,
  className,
}: RulerPickerProps) {
  const { tick, gap } = LOOKS[look];
  const pitch = tick + gap;
  const scrollRef = useRef<ScrollView>(null);
  const [extent, setExtent] = useState(0);
  const lastIndex = useRef(Math.round((value - min) / step));
  // Only user drags change the value; programmatic scrolls must not.
  const dragging = useRef(false);
  const count = Math.round((max - min) / step) + 1;
  const pad = extent / 2 - tick / 2;

  // Follow external value changes (e.g. −/+ buttons) without fighting user drags.
  useEffect(() => {
    const index = Math.round((value - min) / step);
    if (!extent || index === lastIndex.current) return;
    lastIndex.current = index;
    const offset = index * pitch;
    scrollRef.current?.scrollTo(vertical ? { y: offset } : { x: offset });
  }, [value, min, step, extent, vertical, pitch]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!dragging.current) return;
    const offset = vertical ? e.nativeEvent.contentOffset.y : e.nativeEvent.contentOffset.x;
    const index = clamp(Math.round(offset / pitch), 0, count - 1);
    if (index === lastIndex.current) return;
    lastIndex.current = index;
    haptics.select();
    onChange(+(min + index * step).toFixed(2));
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const size = vertical ? e.nativeEvent.layout.height : e.nativeEvent.layout.width;
    setExtent(size);
    const offset = lastIndex.current * pitch;
    requestAnimationFrame(() =>
      scrollRef.current?.scrollTo({ [vertical ? 'y' : 'x']: offset, animated: false }),
    );
  };

  const length = (i: number) => (i % majorEvery === 0 ? 64 : i % midEvery === 0 ? 44 : 24);

  if (look === 'lines') {
    const lineLength = (i: number) =>
      LINE_LENGTH[i % majorEvery === 0 ? 'major' : i % midEvery === 0 ? 'mid' : 'minor'];
    return (
      <View className={cn('h-19 w-full', className)} onLayout={onLayout}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={pitch}
          decelerationRate="fast"
          scrollEventThrottle={16}
          onScroll={onScroll}
          onScrollBeginDrag={() => (dragging.current = true)}
          onMomentumScrollEnd={() => (dragging.current = false)}
          contentContainerStyle={{ paddingHorizontal: pad, paddingTop: MARKER_OVERHANG }}
        >
          {Array.from({ length: count }, (_, i) => (
            <View key={i} style={{ width: tick, marginRight: gap }}>
              <View
                className={i % majorEvery === 0 ? 'bg-fg' : 'bg-outline'}
                style={{ width: tick, height: lineLength(i) }}
              />
              {label && i % majorEvery === 0 ? (
                <Text
                  variant="caption"
                  tone="subtle"
                  className="absolute top-12.5 w-12 text-center tabular-nums"
                  style={{ left: tick / 2 - 24 }}
                >
                  {label(min + i * step)}
                </Text>
              ) : null}
            </View>
          ))}
        </ScrollView>
        <View
          pointerEvents="none"
          className="absolute top-0 w-1 rounded-full bg-accent"
          style={{
            left: extent / 2 - 2,
            height: LINE_LENGTH.major + 2 * MARKER_OVERHANG,
          }}
        />
        <Gradient from="left" stops={EDGE_FADE.lines} />
      </View>
    );
  }

  return (
    <View className={cn(vertical ? 'w-27.5' : 'h-25 w-full', className)} onLayout={onLayout}>
      <ScrollView
        ref={scrollRef}
        horizontal={!vertical}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        snapToInterval={pitch}
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
                ? { height: tick, marginBottom: gap, width: length(i) }
                : { width: tick, marginRight: gap, height: length(i) }
            }
            className="self-end"
          />
        ))}
      </ScrollView>
      <DotPattern
        pointerEvents="none"
        color={colors.accent}
        radius={1.5}
        className="absolute"
        style={
          vertical
            ? { right: 0, top: extent / 2 - tick / 2, height: tick, width: 96 }
            : { bottom: 0, left: extent / 2 - tick / 2, width: tick, height: 96 }
        }
      />
      <Gradient from={vertical ? 'top' : 'left'} stops={EDGE_FADE.dots} />
    </View>
  );
}
