import { useEffect, useState } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { framePath } from '@/shared/lib/frame-path';
import { colors } from '@/shared/lib/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const LAP_MS = 1800;
const FADE_IN_MS = 200;
const FADE_OUT_MS = 300;
/** Each line's share of the outline. */
const DASH = 0.18;
/** On the card's 18pt corner, with the 2pt stroke inside its edge. */
const RADIUS = 17;
const STROKE = 2;

export interface ChaseBorderProps {
  /** Each new number above 0 runs one lap. */
  lap: number;
  /** Fades out a lap under way and holds back the next. */
  stopped: boolean;
}

/** Two neon lines chasing each other once around the parent's edge, gone again between laps. */
export function ChaseBorder({ lap, stopped }: ChaseBorderProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (lap === 0 || stopped) return;
    progress.set(
      withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1, { duration: LAP_MS, easing: Easing.inOut(Easing.ease) }),
      ),
    );
    opacity.set(
      withSequence(
        withTiming(1, { duration: FADE_IN_MS }),
        withDelay(LAP_MS - FADE_IN_MS - FADE_OUT_MS, withTiming(0, { duration: FADE_OUT_MS })),
      ),
    );
    return () => {
      cancelAnimation(progress);
      opacity.set(withTiming(0, { duration: FADE_IN_MS }));
    };
  }, [lap, stopped, progress, opacity]);

  const { d, length } = framePath(size.width, size.height, RADIUS, STROKE / 2);
  const dash = length * DASH;
  const gap = length / 2 - dash;
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: length * (1 - progress.get()),
  }));
  const style = useAnimatedStyle(() => ({ opacity: opacity.get() }));

  return (
    <Animated.View
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      onLayout={(e) => setSize(e.nativeEvent.layout)}
      className="absolute inset-0"
      style={style}
    >
      {size.width > 0 ? (
        <Svg width={size.width} height={size.height}>
          <AnimatedPath
            d={d}
            fill="none"
            stroke={colors.accent}
            strokeWidth={STROKE}
            strokeLinecap="round"
            // Both lines in one stroke, half an outline apart.
            strokeDasharray={[dash, gap, dash, gap]}
            animatedProps={animatedProps}
          />
        </Svg>
      ) : null}
    </Animated.View>
  );
}
