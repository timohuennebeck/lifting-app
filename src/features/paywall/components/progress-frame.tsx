import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { colors } from '@/shared/lib/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const STROKE = 3;
const TRACK = 'rgba(255,255,255,0.12)';

/** Rounded-rect outline starting top-left after the corner, running clockwise. */
function framePath(width: number, height: number, r: number) {
  const o = STROKE / 2;
  const [l, t, rt, b] = [o, o, width - o, height - o];
  return [
    `M${l + r} ${t}H${rt - r}A${r} ${r} 0 0 1 ${rt} ${t + r}`,
    `V${b - r}A${r} ${r} 0 0 1 ${rt - r} ${b}`,
    `H${l + r}A${r} ${r} 0 0 1 ${l} ${b - r}`,
    `V${t + r}A${r} ${r} 0 0 1 ${l + r} ${t}Z`,
  ].join('');
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
  const w = width - STROKE;
  const h = height - STROKE;
  const length = 2 * (w + h) - 8 * radius + 2 * Math.PI * radius;
  const d = framePath(width, height, radius);

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
