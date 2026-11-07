import { View } from 'react-native';
import Animated, { type CSSAnimationKeyframes } from 'react-native-reanimated';

import { cn } from '@/shared/lib/cn';
import { Text } from '@/shared/ui/text';

import { BuildingCaption } from './building-caption';
import type { BuildingVariantProps } from './motion';

/** A reel row's height. */
const ROW = 56;

/**
 * Steps a reel through `count` rows and back to the first: each row holds, then the reel rolls
 * on to the next one (the last row repeats the first, so the loop has no seam).
 */
function reelFrames(count: number): CSSAnimationKeyframes {
  const frames: CSSAnimationKeyframes = {};
  for (let k = 0; k < count; k++) {
    const start = (k / count) * 100;
    const roll = ((k + 0.6) / count) * 100;
    frames[`${start}%`] = { transform: [{ translateY: -k * ROW }] };
    frames[`${roll}%`] = { transform: [{ translateY: -k * ROW }] };
  }
  frames['100%'] = { transform: [{ translateY: -count * ROW }] };
  return frames;
}

/** The window's frame lights up while the reel holds, dims while it rolls. */
function lockFrames(count: number): CSSAnimationKeyframes {
  const frames: CSSAnimationKeyframes = {};
  for (let k = 0; k < count; k++) {
    frames[`${(k / count) * 100}%`] = { opacity: 0 };
    frames[`${((k + 0.12) / count) * 100}%`] = { opacity: 1 };
    frames[`${((k + 0.55) / count) * 100}%`] = { opacity: 1 };
    frames[`${((k + 0.65) / count) * 100}%`] = { opacity: 0 };
  }
  frames['100%'] = { opacity: 0 };
  return frames;
}

interface ReelProps {
  tag: string;
  lifts: readonly string[];
  /** Seconds a row holds and rolls on. */
  step: number;
  delay: number;
}

function Reel({ tag, lifts, step, delay }: ReelProps) {
  const rows = [...lifts, lifts[0]];
  const timing = {
    animationDuration: `${step * lifts.length}s` as const,
    animationDelay: `${delay}s` as const,
    animationIterationCount: 'infinite' as const,
    animationTimingFunction: 'ease-in-out' as const,
  };
  return (
    <View className="flex-row items-center gap-3">
      <View className="w-11 items-center rounded-full bg-paper py-1">
        <Text className="font-inter-semibold text-[12px] leading-4 text-ink">{tag}</Text>
      </View>
      <View className="flex-1 overflow-hidden rounded-2xl bg-surface" style={{ height: ROW }}>
        <Animated.View style={{ animationName: reelFrames(lifts.length), ...timing }}>
          {rows.map((lift, i) => (
            <View key={i} className="justify-center px-4" style={{ height: ROW }}>
              <Text
                numberOfLines={1}
                className={cn('font-inter-semibold text-[17px]', i % 2 ? 'text-fg-mid' : 'text-fg')}
              >
                {lift}
              </Text>
            </View>
          ))}
        </Animated.View>
        {/* Fades top and bottom, like a drum curving away. */}
        <View className="absolute inset-x-0 top-0 h-3 bg-surface opacity-70" />
        <View className="absolute inset-x-0 bottom-0 h-3 bg-surface opacity-70" />
        <Animated.View
          className="absolute inset-0 rounded-2xl border-2 border-accent"
          style={{ animationName: lockFrames(lifts.length), ...timing }}
        />
      </View>
    </View>
  );
}

/**
 * Variant 2, a slot machine: a reel for each of the first three routines rolls through lifts, each
 * at its own pace, and lights up whenever it lands on one.
 */
export function SlotReels({
  line,
  elapsed,
  tags,
  lifts,
}: BuildingVariantProps & { lifts: readonly string[] }) {
  // Each reel starts on another lift.
  const reel = (offset: number) => [...lifts.slice(offset), ...lifts.slice(0, offset)];
  return (
    <View className="flex-1">
      <View className="flex-1 justify-center gap-3 px-6 pb-24" accessibilityElementsHidden>
        <Reel tag={tags[0]} lifts={reel(0)} step={1.1} delay={0} />
        <Reel tag={tags[1] ?? tags[0]} lifts={reel(3)} step={1.4} delay={0.35} />
        <Reel tag={tags[2] ?? tags[0]} lifts={reel(6)} step={1.25} delay={0.7} />
      </View>
      <BuildingCaption line={line} elapsed={elapsed} />
    </View>
  );
}
