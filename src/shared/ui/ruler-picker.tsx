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

const TICK = 5;
// Wide enough that a flick doesn't race through dozens of values.
const GAP = 11;
const PITCH = TICK + GAP;
/**
 * The centre marker's length. Dots repeat every 5px from an element's start, and marker and ticks
 * end on the same line: lengths alike modulo 5 (the ticks' 64, 44 and 24) put the marker's dots
 * on the ticks' dots, so none show between them.
 */
const MARKER = 94;
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
  const scrollRef = useRef<ScrollView>(null);
  const [extent, setExtent] = useState(0);
  // Hidden until it is centred on the value: the first frames are laid out without the scale's
  // width, so it would show at its start and then jump (seen where nothing slides it in).
  const [placed, setPlaced] = useState(false);
  const lastIndex = useRef(Math.round((value - min) / step));
  // From touch-down until a fling settles the scale sets the value; programmatic scrolls don't.
  const dragging = useRef(false);
  const settle = useRef<ReturnType<typeof setTimeout>>(undefined);
  const count = Math.round((max - min) / step) + 1;
  const pad = extent / 2 - TICK / 2;

  useEffect(() => () => clearTimeout(settle.current), []);

  // Follow external value changes (e.g. −/+ buttons). Not while dragging: the drag's own values
  // arrive here a render late, and scrolling back to them made the scale jump.
  useEffect(() => {
    const index = Math.round((value - min) / step);
    if (!extent || dragging.current || index === lastIndex.current) return;
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

  const startDrag = () => {
    clearTimeout(settle.current);
    dragging.current = true;
  };
  // A release without a fling has no momentum events, so the drag ends shortly after it.
  const endDrag = () => {
    settle.current = setTimeout(() => (dragging.current = false), 100);
  };
  const endMomentum = () => {
    clearTimeout(settle.current);
    dragging.current = false;
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const size = vertical ? e.nativeEvent.layout.height : e.nativeEvent.layout.width;
    // Only a new size re-centres the scale; a layout pass mid-drag must not snap it back.
    if (size === extent) return;
    setExtent(size);
    const offset = lastIndex.current * PITCH;
    // Not a computed key ({ [axis]: offset }): the React Compiler can't compile that, and the
    // ruler's 400+ ticks would re-render on every value while dragging.
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo(
        vertical ? { y: offset, animated: false } : { x: offset, animated: false },
      );
      requestAnimationFrame(() => setPlaced(true));
    });
  };

  const length = (i: number) => (i % majorEvery === 0 ? 64 : i % midEvery === 0 ? 44 : 24);

  return (
    <View
      className={cn(vertical ? 'w-27.5' : 'h-25 w-full', className)}
      style={{ opacity: placed ? 1 : 0 }}
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
        onScrollBeginDrag={startDrag}
        onScrollEndDrag={endDrag}
        onMomentumScrollBegin={() => clearTimeout(settle.current)}
        onMomentumScrollEnd={endMomentum}
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
        color={colors.accent}
        radius={1.5}
        className="absolute"
        style={
          vertical
            ? { right: 0, top: extent / 2 - TICK / 2, height: TICK, width: MARKER }
            : { bottom: 0, left: extent / 2 - TICK / 2, width: TICK, height: MARKER }
        }
      />
      <Gradient from={vertical ? 'top' : 'left'} stops={EDGE_FADE} />
    </View>
  );
}
