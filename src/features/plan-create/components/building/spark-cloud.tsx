import type { ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, type CSSAnimationKeyframes } from 'react-native-reanimated';

import { cn } from '@/shared/lib/cn';
import { SpinnerGlyph } from '@/shared/ui/spark-glyph';
import { Text } from '@/shared/ui/text';

import { type BuildingVariantProps, FLOAT, loop, POP } from './motion';

const TWINKLE: CSSAnimationKeyframes = {
  '0%': { opacity: 0, transform: [{ scale: 0.3 }, { rotate: '0deg' }] },
  '50%': { opacity: 1, transform: [{ scale: 1 }, { rotate: '90deg' }] },
  '100%': { opacity: 0, transform: [{ scale: 0.3 }, { rotate: '0deg' }] },
};

const STARS = [
  { x: 0.1, y: 0.12, size: 14, delay: 0 },
  { x: 0.86, y: 0.14, size: 10, delay: 0.6 },
  { x: 0.06, y: 0.52, size: 12, delay: 1.2 },
  { x: 0.9, y: 0.5, size: 16, delay: 1.8 },
  { x: 0.5, y: 0.08, size: 9, delay: 0.9 },
  { x: 0.4, y: 0.86, size: 11, delay: 1.5 },
] as const;

const SLOT = { width: 200, height: 80 };

/** Something at its place (`x`, `y` its centre, as shares of the screen): pops in, then bobs. */
function Floating({
  x,
  y,
  order,
  float,
  children,
}: {
  x: number;
  y: number;
  order: number;
  float: number;
  children: ReactNode;
}) {
  const { width, height } = useWindowDimensions();
  return (
    <View
      className="absolute items-center justify-center"
      style={{ ...SLOT, left: x * width - SLOT.width / 2, top: y * height - SLOT.height / 2 }}
    >
      <Animated.View
        collapsable={false}
        style={{
          animationName: POP,
          animationDuration: '0.5s',
          animationDelay: `${0.3 + order * 0.45}s` as const,
          animationFillMode: 'backwards',
          animationTimingFunction: 'ease-out',
        }}
      >
        <Animated.View collapsable={false} style={loop(FLOAT, float, order * 0.3)}>
          {children}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

function Chip({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <View
      className={cn(
        'h-7.5 max-w-45 justify-center rounded-full px-3',
        accent ? 'bg-accent' : 'bg-pill',
      )}
    >
      <Text
        numberOfLines={1}
        className={cn('font-inter-semibold text-[13px]', accent ? 'text-on-accent' : 'text-fg-mid')}
      >
        {label}
      </Text>
    </View>
  );
}

/** A small plan page with its routine badge, 44 × 56. */
function MiniPage({ tag }: { tag: string }) {
  return (
    <View
      className="h-14 w-11 gap-1 rounded-[9px] bg-paper p-1.75"
      style={{ boxShadow: '0 10px 24px rgba(0,0,0,0.5)' }}
    >
      <View className="self-start rounded-[3px] bg-ink px-1 py-0.5">
        <Text className="font-inter-semibold text-[7px] leading-2 text-paper">{tag}</Text>
      </View>
      {[80, 60, 70].map((w) => (
        <View key={w} className="h-0.75 rounded-xs bg-[#BDB7A9]" style={{ width: `${w}%` }} />
      ))}
    </View>
  );
}

/**
 * Variant 1, like the plan import's reading screen: the sparkle in the middle, the user's answers
 * and the routine pages popping in around it and floating, what is being done and the time below.
 */
export function SparkCloud({ line, elapsed, chips, tags }: BuildingVariantProps) {
  const { width, height } = useWindowDimensions();
  const [goal, frequency, equipment, focus] = chips;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" accessibilityElementsHidden>
      <View
        className="absolute inset-x-0 items-center gap-1.5 px-8"
        style={{ top: height * 0.47 - 60 }}
      >
        <Animated.View collapsable={false} style={loop(FLOAT, 2.4)}>
          <SpinnerGlyph />
        </Animated.View>
        <Animated.View key={line} entering={FadeIn.duration(350)}>
          <Text numberOfLines={1} className="text-center font-inter-semibold text-[15px] text-fg">
            {line}
          </Text>
        </Animated.View>
        <Text className="font-inter text-xs text-subtle tabular-nums">{elapsed}</Text>
      </View>
      {STARS.map((star, i) => (
        <Animated.View
          collapsable={false}
          key={i}
          className="absolute"
          style={{ left: star.x * width, top: star.y * height, ...loop(TWINKLE, 2.4, star.delay) }}
        >
          <Text
            className="font-inter-bold text-accent"
            style={{ fontSize: star.size, lineHeight: star.size * 1.2 }}
          >
            ✦
          </Text>
        </Animated.View>
      ))}
      <Floating x={0.3} y={0.2} order={0} float={2.6}>
        <Chip label={goal} />
      </Floating>
      <Floating x={0.72} y={0.26} order={1} float={2.4}>
        <Chip label={frequency} accent />
      </Floating>
      <Floating x={0.18} y={0.34} order={2} float={1.8}>
        <MiniPage tag={tags[0]} />
      </Floating>
      <Floating x={0.84} y={0.38} order={3} float={2}>
        <MiniPage tag={tags[1] ?? tags[0]} />
      </Floating>
      <Floating x={0.3} y={0.64} order={4} float={2.2}>
        <Chip label={equipment} />
      </Floating>
      <Floating x={0.8} y={0.6} order={5} float={2.8}>
        <MiniPage tag={tags[2] ?? tags[0]} />
      </Floating>
      <Floating x={0.55} y={0.74} order={6} float={2.5}>
        <Chip label={focus} />
      </Floating>
      <Floating x={0.2} y={0.8} order={7} float={1.9}>
        <Chip label="3 × 10" accent />
      </Floating>
    </View>
  );
}
