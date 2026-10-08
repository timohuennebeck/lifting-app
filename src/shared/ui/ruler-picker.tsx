import { useEffect, useRef, useState } from 'react';
import {
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  View,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { cn } from '@/shared/lib/cn';
import { haptics } from '@/shared/lib/haptics';
import { colors, useAccentColor } from '@/shared/lib/theme';

const TICK = 5;
const GAP = 5;
const PITCH = TICK + GAP;

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
    const offset = vertical ? e.nativeEvent.contentOffset.y : e.nativeEvent.contentOffset.x;
    const index = Math.min(count - 1, Math.max(0, Math.round(offset / PITCH)));
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
  const fadeId = vertical ? 'fade-v' : 'fade-h';

  return (
    <View
      className={cn(vertical ? 'w-[110px]' : 'h-[100px] w-full', className)}
      onLayout={onLayout}
    >
      <ScrollView
        ref={scrollRef}
        horizontal={!vertical}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        snapToInterval={PITCH}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={onScroll}
        contentContainerStyle={
          vertical ? { paddingVertical: pad } : { paddingHorizontal: pad, alignItems: 'flex-end' }
        }
      >
        {Array.from({ length: count }, (_, i) => (
          <View
            key={i}
            style={
              vertical
                ? { height: TICK, marginBottom: GAP, width: length(i) }
                : { width: TICK, marginRight: GAP, height: length(i) }
            }
            className={cn('self-end', i % majorEvery === 0 ? 'bg-muted' : 'bg-track')}
          />
        ))}
      </ScrollView>
      <View
        pointerEvents="none"
        className="absolute"
        style={[
          { backgroundColor: accent },
          vertical
            ? { right: 0, top: extent / 2 - TICK / 2, height: TICK, width: 96 }
            : { bottom: 0, left: extent / 2 - TICK / 2, width: TICK, height: 96 },
        ]}
      />
      <Svg pointerEvents="none" style={{ position: 'absolute', inset: 0 }}>
        <Defs>
          <LinearGradient
            id={fadeId}
            x1="0"
            y1="0"
            x2={vertical ? '0' : '1'}
            y2={vertical ? '1' : '0'}
          >
            <Stop offset="0" stopColor={colors.bg} stopOpacity={1} />
            <Stop offset="0.3" stopColor={colors.bg} stopOpacity={0} />
            <Stop offset="0.7" stopColor={colors.bg} stopOpacity={0} />
            <Stop offset="1" stopColor={colors.bg} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${fadeId})`} />
      </Svg>
    </View>
  );
}
