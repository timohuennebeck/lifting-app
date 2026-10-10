import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { type CSSAnimationKeyframes } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { CheckBadge } from '@/shared/ui/check-item';
import { Gradient } from '@/shared/ui/gradient';
import { Text } from '@/shared/ui/text';

const PULSE: CSSAnimationKeyframes = {
  from: { transform: [{ scale: 1.005 }] },
  to: { transform: [{ scale: 1.035 }] },
};

/**
 * Pie slice from `start` (0–1, clockwise from 12 o'clock) round to the top, large
 * enough to cover a w×h box: the not-yet-analysed share of the tile.
 */
function remainingSlice(w: number, h: number, start: number) {
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.hypot(w, h);
  if (start <= 0) return `M0 0H${w}V${h}H0Z`;
  const angle = start * 2 * Math.PI;
  const x = cx + r * Math.sin(angle);
  const y = cy - r * Math.cos(angle);
  const large = 1 - start > 0.5 ? 1 : 0;
  return `M${cx} ${cy}L${x} ${y}A${r} ${r} 0 ${large} 1 ${cx} ${cy - r}Z`;
}

export interface AnalysisTileProps {
  uri: string;
  label: string;
  /** 0–1 share of this photo that is analysed. */
  progress: number;
  active: boolean;
  height: number;
}

/** Photo tile of the analysis grid with a clockwise reveal (design 08c-H). */
export function AnalysisTile({ uri, label, progress, active, height }: AnalysisTileProps) {
  const [width, setWidth] = useState(0);
  const done = progress >= 1;
  return (
    <Animated.View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      className={cn('flex-1 rounded-[22px]', !done && !active && 'opacity-40')}
      style={[
        { height, zIndex: active ? 2 : 1 },
        active
          ? {
              boxShadow: `0 0 0 2px ${colors.accent}, 0 0 28px ${colors.accent}59`,
              animationName: PULSE,
              animationDuration: '0.47s',
              animationDirection: 'alternate',
              animationIterationCount: 'infinite',
              animationTimingFunction: 'ease-in-out',
            }
          : { animationName: 'none', animationDuration: '0s' },
      ]}
    >
      <View className="flex-1 overflow-hidden rounded-[22px] bg-surface">
        <Image source={{ uri }} contentFit="cover" style={StyleSheet.absoluteFill} />
        {width && !done ? (
          <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
            <Path d={remainingSlice(width, height, progress)} fill="rgba(10,10,10,0.72)" />
          </Svg>
        ) : null}
        <Gradient from="bottom" size={70} color="black" opacity={0.75} />
        {!active ? (
          <View
            pointerEvents="none"
            className="absolute inset-0 rounded-[22px] border border-white/10"
          />
        ) : null}
        <View className="absolute right-3 bottom-3 left-3 flex-row items-center justify-between">
          <Text variant="label" className="text-sm">
            {label}
          </Text>
          {done ? (
            <CheckBadge size={22} glyph={11} />
          ) : (
            <Text variant="caption" tone="secondary" className="text-xs">
              {`${Math.round(progress * 100)}%`}
            </Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
}
