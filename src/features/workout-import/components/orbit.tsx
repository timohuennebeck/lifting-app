import { type ReactNode, useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { type CSSAnimationKeyframes } from 'react-native-reanimated';
import Svg, { Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Text } from '@/shared/ui/text';

import { OrbitFile } from './file-art';

const SPIN: CSSAnimationKeyframes = {
  from: { transform: [{ rotate: '0deg' }] },
  to: { transform: [{ rotate: '360deg' }] },
};
const SPIN_BACK: CSSAnimationKeyframes = {
  from: { transform: [{ rotate: '0deg' }] },
  to: { transform: [{ rotate: '-360deg' }] },
};
const FLOAT: CSSAnimationKeyframes = {
  '0%': { transform: [{ translateY: 0 }] },
  '50%': { transform: [{ translateY: -8 }] },
  '100%': { transform: [{ translateY: 0 }] },
};
/** A satellite popping in, a little past its size and back. */
const POP: CSSAnimationKeyframes = {
  '0%': { opacity: 0, transform: [{ scale: 0.3 }] },
  '60%': { opacity: 1, transform: [{ scale: 1.12 }] },
  '100%': { opacity: 1, transform: [{ scale: 1 }] },
};
/** The seconds between satellites popping in, across the rings in turn. */
const POP_STEP = 0.45;
const TWINKLE: CSSAnimationKeyframes = {
  '0%': { opacity: 0, transform: [{ scale: 0.3 }, { rotate: '0deg' }] },
  '50%': { opacity: 1, transform: [{ scale: 1 }, { rotate: '90deg' }] },
  '100%': { opacity: 0, transform: [{ scale: 0.3 }, { rotate: '0deg' }] },
};

const loop = (name: CSSAnimationKeyframes, seconds: number, linear?: boolean, delay = 0) => ({
  animationName: name,
  animationDuration: `${seconds}s` as const,
  animationDelay: `${delay}s` as const,
  animationIterationCount: 'infinite' as const,
  animationTimingFunction: linear ? ('linear' as const) : ('ease-in-out' as const),
});

/**
 * Something on a ring: a chip, a small file or a dot; `float` is its bob in seconds, `order` its
 * place in the popping in.
 */
interface Satellite {
  node: ReactNode;
  order: number;
  float?: number;
}

/** The ✦ sparkles twinkling around the rings, placed as shares of the screen. */
const STARS = [
  { x: 0.12, y: 0.1, size: 14, delay: 0 },
  { x: 0.82, y: 0.16, size: 10, delay: 0.6 },
  { x: 0.08, y: 0.62, size: 12, delay: 1.2 },
  { x: 0.88, y: 0.58, size: 16, delay: 1.8 },
  { x: 0.48, y: 0.04, size: 9, delay: 0.9 },
  { x: 0.7, y: 0.78, size: 11, delay: 1.5 },
] as const;

/** Room a satellite is centred in: text is measured against it (no percent translate in RN). */
const SLOT = { width: 200, height: 80 };

/** A ring turning around the centre once per `seconds`; its satellites stay upright. */
function Ring({
  radius,
  seconds,
  reverse,
  items,
}: {
  radius: number;
  seconds: number;
  reverse?: boolean;
  items: Satellite[];
}) {
  return (
    <Animated.View
      className="absolute top-1/2 left-1/2 size-0"
      style={loop(reverse ? SPIN_BACK : SPIN, seconds, true)}
    >
      {items.map((item, i) => {
        const angle = (2 * Math.PI * i) / items.length;
        return (
          <View
            key={i}
            className="absolute items-center justify-center"
            style={{
              ...SLOT,
              left: radius * Math.cos(angle) - SLOT.width / 2,
              top: radius * Math.sin(angle) - SLOT.height / 2,
            }}
          >
            <Animated.View style={loop(reverse ? SPIN : SPIN_BACK, seconds, true)}>
              <Animated.View
                style={{
                  animationName: POP,
                  animationDuration: '0.5s',
                  animationDelay: `${0.3 + item.order * POP_STEP}s` as const,
                  animationFillMode: 'backwards',
                  animationTimingFunction: 'ease-out',
                }}
              >
                <Animated.View style={item.float ? loop(FLOAT, item.float) : undefined}>
                  {item.node}
                </Animated.View>
              </Animated.View>
            </Animated.View>
          </View>
        );
      })}
    </Animated.View>
  );
}

function Chip({ label, accent }: { label: string; accent?: boolean }) {
  return (
    // A plain solid fill: no shadow (on iOS it could let the dark ground through).
    <View
      className="h-7.5 justify-center rounded-full px-3"
      style={{ backgroundColor: accent ? colors.accent : PILL, opacity: 1 }}
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

/** The chips' fill (--color-pill). */
const PILL = '#1C1C1C';

const Dot = ({ size, color }: { size: number; color: string }) => (
  <View className="rounded-full" style={{ width: size, height: size, backgroundColor: color }} />
);

/** The glyphs the centre cycles through while reading, one every 100 ms (as in the design). */
const GLYPHS = ['·', '✢', '✳', '✶', '✳', '✢'] as const;

function SpinnerGlyph() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(id);
  }, []);
  return (
    <Text className="w-13 text-center font-inter-bold text-[52px] leading-[60px] text-accent">
      {GLYPHS[tick % GLYPHS.length]}
    </Text>
  );
}

export interface OrbitProps {
  /** Chips of the inner ring: an exercise, a weight, an exercise, sets × reps. */
  inner: readonly [string, string, string, string];
  /** Chips of the outer ring: an exercise, "PR", reps, an exercise, a weight. */
  outer: readonly [string, string, string, string, string];
  /** What is being done, and how long it has taken. */
  label: string;
  caption: string;
  /** Everything is read: a tick pops up in place of the sparkle. */
  done?: boolean;
}

/** 13m31: chips and files circling the centre while the file is read, sparkles around them. */
export function Orbit({ inner, outer, label, caption, done }: OrbitProps) {
  const { width, height } = useWindowDimensions();
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" accessibilityElementsHidden>
      <Ring
        radius={128}
        seconds={34}
        items={[
          { node: <Chip label={inner[0]} />, order: 0, float: 2.8 },
          { node: <Chip label={inner[1]} accent />, order: 3, float: 2.8 },
          { node: <Chip label={inner[2]} />, order: 6, float: 2.4 },
          { node: <Chip label={inner[3]} />, order: 9, float: 2.8 },
        ]}
      />
      <Ring
        radius={210}
        seconds={44}
        reverse
        items={[
          { node: <Chip label={outer[0]} />, order: 1, float: 2.4 },
          { node: <Chip label={outer[1]} accent />, order: 4, float: 2.8 },
          { node: <Chip label={outer[2]} />, order: 7, float: 2.4 },
          { node: <Chip label={outer[3]} />, order: 10, float: 2 },
          { node: <Chip label={outer[4]} />, order: 12, float: 2 },
        ]}
      />
      {STARS.map((star, i) => (
        <Animated.View
          key={i}
          className="absolute"
          style={{
            left: star.x * width,
            top: star.y * height,
            ...loop(TWINKLE, 2.4, false, star.delay),
          }}
        >
          <Text
            className="font-inter-bold text-accent"
            style={{ fontSize: star.size, lineHeight: star.size * 1.2 }}
          >
            ✦
          </Text>
        </Animated.View>
      ))}
      <Ring
        radius={172}
        seconds={30}
        reverse
        items={[
          { node: <OrbitFile label="CSV" />, order: 2, float: 1.8 },
          { node: <Dot size={6} color={colors.accent} />, order: 5 },
          { node: <OrbitFile label="XLSX" />, order: 8, float: 1.8 },
          { node: <Dot size={8} color="#2E2E2B" />, order: 11 },
          { node: <OrbitFile label="CSV" />, order: 13, float: 1.8 },
          { node: <Dot size={4} color={colors.accent} />, order: 14 },
        ]}
      />
      <View
        className="absolute inset-x-0 h-37.5 items-center justify-center gap-1.5"
        // Above the rings: chips pass behind what is being done.
        style={{ top: height / 2 - 75, zIndex: 10 }}
      >
        <Svg
          width={150}
          height={150}
          style={{ position: 'absolute', top: 0, left: width / 2 - 75 }}
        >
          <Defs>
            <RadialGradient id="orbit-centre" cx="50%" cy="50%" r="50%">
              <Stop offset="0.55" stopColor={colors.bg} stopOpacity={1} />
              <Stop offset="0.72" stopColor={colors.bg} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect width={150} height={150} fill="url(#orbit-centre)" />
        </Svg>
        {done ? (
          <Animated.View
            className="size-14 items-center justify-center rounded-full bg-accent"
            style={{
              animationName: POP,
              animationDuration: '0.5s',
              animationTimingFunction: 'ease-out',
            }}
          >
            <Svg width={24} height={18} viewBox="0 0 13 10">
              <Path
                d="M1.5 5l3.5 3.5L11.5 1.5"
                stroke={colors.onAccent}
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Animated.View>
        ) : (
          <Animated.View style={loop(FLOAT, 2.4)}>
            <SpinnerGlyph />
          </Animated.View>
        )}
        <Text numberOfLines={1} className="font-inter-semibold text-[15px] text-fg">
          {label}
        </Text>
        <Text className="font-inter text-xs text-subtle">{caption}</Text>
      </View>
    </View>
  );
}
