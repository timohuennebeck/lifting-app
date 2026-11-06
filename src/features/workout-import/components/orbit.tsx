import { type ReactNode, useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { type CSSAnimationKeyframes } from 'react-native-reanimated';
import Svg, { Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Text } from '@/shared/ui/text';

import { OrbitFile } from './file-art';

const FLOAT: CSSAnimationKeyframes = {
  '0%': { transform: [{ translateY: 0 }] },
  '50%': { transform: [{ translateY: -8 }] },
  '100%': { transform: [{ translateY: 0 }] },
};
/** A chip or file popping in, a little past its size and back. */
const POP: CSSAnimationKeyframes = {
  '0%': { opacity: 0, transform: [{ scale: 0.3 }] },
  '60%': { opacity: 1, transform: [{ scale: 1.12 }] },
  '100%': { opacity: 1, transform: [{ scale: 1 }] },
};
/** The seconds between chips and files popping in. */
const POP_STEP = 0.45;
const TWINKLE: CSSAnimationKeyframes = {
  '0%': { opacity: 0, transform: [{ scale: 0.3 }, { rotate: '0deg' }] },
  '50%': { opacity: 1, transform: [{ scale: 1 }, { rotate: '90deg' }] },
  '100%': { opacity: 0, transform: [{ scale: 0.3 }, { rotate: '0deg' }] },
};

const loop = (name: CSSAnimationKeyframes, seconds: number, delay = 0) => ({
  animationName: name,
  animationDuration: `${seconds}s` as const,
  animationDelay: `${delay}s` as const,
  animationIterationCount: 'infinite' as const,
  animationTimingFunction: 'ease-in-out' as const,
});

/** The ✦ sparkles twinkling around the rings, placed as shares of the screen. */
const STARS = [
  { x: 0.12, y: 0.1, size: 14, delay: 0 },
  { x: 0.82, y: 0.16, size: 10, delay: 0.6 },
  { x: 0.08, y: 0.62, size: 12, delay: 1.2 },
  { x: 0.88, y: 0.58, size: 16, delay: 1.8 },
  { x: 0.48, y: 0.04, size: 9, delay: 0.9 },
  { x: 0.7, y: 0.78, size: 11, delay: 1.5 },
] as const;

/** Room a chip is centred in: text is measured against it (no percent translate in RN). */
const SLOT = { width: 200, height: 80 };

/**
 * A chip or file at its place, as shares of the screen (`x`, `y` its centre): it pops in as
 * `order` says and then bobs in place every `float` seconds, from `phase` on.
 */
function Floating({
  x,
  y,
  order,
  float,
  phase,
  children,
}: {
  x: number;
  y: number;
  order: number;
  float: number;
  phase: number;
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
          animationDelay: `${0.3 + order * POP_STEP}s` as const,
          animationFillMode: 'backwards',
          animationTimingFunction: 'ease-out',
        }}
      >
        <Animated.View collapsable={false} style={loop(FLOAT, float, phase)}>
          {children}
        </Animated.View>
      </Animated.View>
    </View>
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

type Spark = 'cross' | 'asterisk' | 'star';

/**
 * The centre's sparkle, drawn rather than typed: iOS shows "✳" as a green emoji. The four
 * teardrops (✢), the eight spokes (✳) and the six-pointed star (✶) of the design.
 */
function SparkGlyph({ kind }: { kind: Spark }) {
  return (
    <Svg width={52} height={52} viewBox="0 0 52 52">
      {kind === 'cross'
        ? [0, 90, 180, 270].map((angle) => (
            <Path
              key={angle}
              d="M26 26C21.5 19.5 19 13.5 19 10a7 7 0 0 1 14 0c0 3.5-2.5 9.5-7 16z"
              fill={colors.accent}
              transform={`rotate(${angle} 26 26)`}
            />
          ))
        : null}
      {kind === 'asterisk' ? (
        <Path
          d="M26 4v44M4 26h44M10.4 10.4l31.2 31.2M41.6 10.4L10.4 41.6"
          stroke={colors.accent}
          strokeWidth={6}
        />
      ) : null}
      {kind === 'star' ? (
        <Path
          d="M26.0 2.0L29.8 19.5L46.8 14.0L33.5 26.0L46.8 38.0L29.8 32.5L26.0 50.0L22.2 32.5L5.2 38.0L18.5 26.0L5.2 14.0L22.2 19.5Z"
          fill={colors.accent}
          stroke={colors.accent}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      ) : null}
    </Svg>
  );
}

/** The sparkles the centre cycles through while reading, one every 100 ms (as in the design). */
const SPARKS: readonly Spark[] = ['cross', 'asterisk', 'star', 'asterisk'];

function SpinnerGlyph() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(id);
  }, []);
  return <SparkGlyph kind={SPARKS[tick % SPARKS.length]} />;
}

export interface OrbitProps {
  /** The chips: an exercise, a weight, sets × reps, an exercise, reps. */
  chips: readonly [string, string, string, string, string];
  /** What is being done, and how long it has taken. */
  label: string;
  caption: string;
  /** Everything is read: the sparkle stops on the cross (✢) and the label turns accent, as in the design. */
  done?: boolean;
}

/**
 * 13m31: chips and files floating in place above and below the centre while the file is read,
 * sparkles around them. Their places stay inside the screen and apart from each other (L5).
 */
export function Orbit({ chips, label, caption, done }: OrbitProps) {
  const { width, height } = useWindowDimensions();
  const [lift, weight, sets, otherLift, reps] = chips;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" accessibilityElementsHidden>
      <View
        className="absolute inset-x-0 h-37.5 items-center justify-center gap-1.5"
        style={{ top: height / 2 - 75 }}
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
          <SparkGlyph kind="cross" />
        ) : (
          <Animated.View collapsable={false} style={loop(FLOAT, 2.4)}>
            <SpinnerGlyph />
          </Animated.View>
        )}
        <Text
          numberOfLines={1}
          className={cn('font-inter-semibold text-[15px]', done ? 'text-accent' : 'text-fg')}
        >
          {label}
        </Text>
        <Text className="font-inter text-xs text-subtle">{caption}</Text>
      </View>
      {STARS.map((star, i) => (
        <Animated.View
          collapsable={false}
          key={i}
          className="absolute"
          style={{
            left: star.x * width,
            top: star.y * height,
            ...loop(TWINKLE, 2.4, star.delay),
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
      {/* Above the centre */}
      <Floating x={0.28} y={0.24} order={0} float={2.6} phase={0.3}>
        <Chip label={lift} />
      </Floating>
      <Floating x={0.73} y={0.28} order={1} float={2.4} phase={1.1}>
        <Chip label={weight} accent />
      </Floating>
      <Floating x={0.18} y={0.37} order={2} float={1.8} phase={0.6}>
        <OrbitFile label="CSV" />
      </Floating>
      <Floating x={0.82} y={0.39} order={3} float={2} phase={0.2}>
        <OrbitFile label="XLSX" />
      </Floating>
      {/* Below it */}
      <Floating x={0.24} y={0.66} order={4} float={2.2} phase={0.9}>
        <Chip label={sets} />
      </Floating>
      <Floating x={0.74} y={0.64} order={5} float={2.8} phase={0.4}>
        <Chip label={otherLift} />
      </Floating>
      <Floating x={0.5} y={0.76} order={6} float={2} phase={1.4}>
        <Chip label="PR" accent />
      </Floating>
      <Floating x={0.82} y={0.77} order={7} float={1.9} phase={0.8}>
        <OrbitFile label="CSV" />
      </Floating>
      <Floating x={0.2} y={0.78} order={8} float={2.5} phase={0.1}>
        <Chip label={reps} />
      </Floating>
    </View>
  );
}
