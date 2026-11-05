import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { framePath } from '@/shared/lib/frame-path';
import { clamp } from '@/shared/lib/math';
import { colors } from '@/shared/lib/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const STROKE = 3;
const TRACK = 'rgba(255,255,255,0.12)';

/**
 * The progress (0–1) at the point of the outline nearest to (x, y): the side closest to the
 * touch, then the position along it in the outline's clockwise order.
 */
export function progressAt(x: number, y: number, width: number, height: number, r: number) {
  const w = width - STROKE;
  const h = height - STROKE;
  const top = w - 2 * r;
  const side = h - 2 * r;
  const arc = (Math.PI * r) / 2;
  const distances = [y, width - x, height - y, x];
  const nearest = distances.indexOf(Math.min(...distances));
  const along = [
    clamp(x - r, 0, top),
    top + arc + clamp(y - r, 0, side),
    top + side + 2 * arc + clamp(w - r - x, 0, top),
    2 * top + side + 3 * arc + clamp(h - r - y, 0, side),
  ][nearest];
  return along / (2 * (top + side) + 4 * arc);
}

export interface ProgressFrameProps {
  width: number;
  height: number;
  /** Corner radius of the stroke's centre line. */
  radius: number;
  /** 0–1 playback progress. */
  progress: number;
  /** Duration of the linear glide to each new progress value. */
  tickMs: number;
}

/** Accent progress line that runs once around the video frame per playback loop. */
export function ProgressFrame({ width, height, radius, progress, tickMs }: ProgressFrameProps) {
  const value = useSharedValue(progress);
  const { d, length } = framePath(width, height, radius, STROKE / 2);

  useEffect(() => {
    // Jump back on loop restarts or seeks; glide forward otherwise.
    const jump = progress < value.get();
    value.set(jump ? progress : withTiming(progress, { duration: tickMs, easing: Easing.linear }));
  }, [progress, tickMs, value]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: length * (1 - value.get()),
  }));

  if (width <= 0 || height <= 0) return null;
  return (
    <Svg width={width} height={height} pointerEvents="none" style={{ position: 'absolute' }}>
      <Path d={d} fill="none" stroke={TRACK} strokeWidth={STROKE} />
      <AnimatedPath
        d={d}
        fill="none"
        stroke={colors.accent}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={[length, length]}
        animatedProps={animatedProps}
      />
    </Svg>
  );
}
