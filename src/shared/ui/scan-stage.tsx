import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import Animated, { type CSSAnimationKeyframes } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { cn } from '@/shared/lib/cn';
import { useAccentColor } from '@/shared/lib/theme';

import { Text } from './text';

/** Design frame the chip coordinates refer to (390 wide, scan centre at y = 360). */
const FRAME_WIDTH = 390;
const FRAME_CENTER = 360;

const SPIN: CSSAnimationKeyframes = {
  from: { transform: [{ rotate: '0deg' }] },
  to: { transform: [{ rotate: '360deg' }] },
};
const RIPPLE: CSSAnimationKeyframes = {
  from: { transform: [{ scale: 0.55 }], opacity: 0.8 },
  to: { transform: [{ scale: 1.7 }], opacity: 0 },
};
const FLOAT: CSSAnimationKeyframes = {
  '0%': { transform: [{ translateY: 0 }] },
  '50%': { transform: [{ translateY: -12 }] },
  '100%': { transform: [{ translateY: 0 }] },
};

export interface ScanChip {
  label: string;
  /** Position in the 390pt design frame. */
  x: number;
  y: number;
  accent?: boolean;
  /** Float cycle in seconds. */
  duration?: number;
  delay?: number;
}

export interface ScanStageProps {
  /** 0–100 */
  percent: number;
  stage: string;
  segments: number;
  activeSegment: number;
  chips?: ScanChip[];
  /** Artwork in the middle of the ripples (paper stack, mic, …). */
  children?: ReactNode;
  /** Pinned above the artwork, e.g. a progress header. */
  header?: ReactNode;
  /** Tapping anywhere, e.g. to skip the animation. */
  onPress?: () => void;
  /** Screen-reader label for `onPress`. */
  pressLabel?: string;
  /** Vertical centre of the artwork as a share of the screen height. */
  centerRatio?: number;
}

/** Animated "working on it" stage: glow, ripples, floating chips and a segmented progress. */
export function ScanStage({
  percent,
  stage,
  segments,
  activeSegment,
  chips = [],
  children,
  header,
  onPress,
  pressLabel,
  centerRatio = FRAME_CENTER / 844,
}: ScanStageProps) {
  const accent = useAccentColor();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const cy = height * centerRatio;
  const scaleX = width / FRAME_WIDTH;
  const around = (size: number) => ({
    position: 'absolute' as const,
    width: size,
    height: size,
    left: width / 2 - size / 2,
    top: cy - size / 2,
  });

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={pressLabel}
      onPress={onPress}
      disabled={!onPress}
      className="flex-1 overflow-hidden bg-[#050505]"
    >
      <Animated.View
        style={[
          around(560),
          {
            opacity: 0.8,
            animationName: SPIN,
            animationDuration: '7s',
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear',
          },
        ]}
      >
        <Svg width={560} height={560}>
          <Defs>
            <RadialGradient id="scan-glow-a" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={accent} stopOpacity={0.55} />
              <Stop offset="1" stopColor={accent} stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="scan-glow-b" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={accent} stopOpacity={0.25} />
              <Stop offset="1" stopColor={accent} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse cx={380} cy={190} rx={170} ry={150} fill="url(#scan-glow-a)" />
          <Ellipse cx={150} cy={370} rx={140} ry={130} fill="url(#scan-glow-b)" />
        </Svg>
      </Animated.View>
      {[0, 1, 2].map((i) => (
        <Animated.View
          key={i}
          style={[
            around(340),
            {
              borderRadius: 170,
              borderWidth: 1.5,
              borderColor: `${accent}B3`,
              animationName: RIPPLE,
              animationDuration: '3s',
              animationDelay: `${i}s`,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'ease-out',
              animationFillMode: 'backwards',
            },
          ]}
        />
      ))}
      <Animated.View
        style={[
          around(300),
          {
            borderRadius: 150,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: 'rgba(255,255,255,0.18)',
            animationName: SPIN,
            animationDuration: '30s',
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear',
          },
        ]}
      />
      {header ? (
        <View className="absolute inset-x-0 top-0" style={{ paddingTop: insets.top }}>
          {header}
        </View>
      ) : null}
      <View
        pointerEvents="none"
        className="absolute items-center justify-center"
        style={{ left: 0, right: 0, top: cy - 160, height: 320 }}
      >
        {children}
      </View>
      {chips.map((chip, i) => (
        <Animated.View
          key={`${chip.label}-${i}`}
          pointerEvents="none"
          className="absolute z-10"
          style={{
            left: chip.x * scaleX,
            maxWidth: width - chip.x * scaleX - 8,
            top: cy + chip.y - FRAME_CENTER,
            animationName: FLOAT,
            animationDuration: `${chip.duration ?? 3.5}s`,
            animationDelay: `${chip.delay ?? 0}s`,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'ease-in-out',
          }}
        >
          <View
            className={cn('rounded-full px-3 py-[7px]', chip.accent ? 'bg-accent' : 'bg-elevated')}
          >
            <Text variant="caption" tone={chip.accent ? 'onAccent' : 'default'} numberOfLines={1}>
              {chip.label}
            </Text>
          </View>
        </Animated.View>
      ))}
      <View
        className="absolute inset-x-0 items-center gap-3 px-6"
        style={{ bottom: insets.bottom + 34 }}
      >
        <Text className="font-inter-semibold text-[64px] leading-[64px] text-fg tabular-nums">
          {`${Math.round(percent)}%`}
        </Text>
        <Text variant="bodyStrong" className="text-center text-base">
          {stage}
        </Text>
        <View className="mt-2.5 w-full flex-row gap-1">
          {Array.from({ length: segments }, (_, i) => (
            <View
              key={i}
              className={cn(
                'h-1 flex-1 rounded-sm',
                i <= activeSegment ? 'bg-accent' : 'bg-control',
              )}
            />
          ))}
        </View>
      </View>
    </Pressable>
  );
}

/**
 * Elapsed share (0–1) of a fixed-length animation, updated ~16×/s.
 * Calls `onDone` once when the time is up.
 */
export function useTimedProgress(durationMs: number, onDone?: () => void) {
  const [progress, setProgress] = useState(0);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });
  useEffect(() => {
    const start = Date.now();
    let finished = false;
    const id = setInterval(() => {
      const next = Math.min(1, (Date.now() - start) / durationMs);
      setProgress(next);
      if (next >= 1 && !finished) {
        finished = true;
        clearInterval(id);
        done.current?.();
      }
    }, 60);
    return () => clearInterval(id);
  }, [durationMs]);
  return progress;
}
