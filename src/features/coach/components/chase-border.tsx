import { useEffect, useState } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  FadeOut,
  type SharedValue,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { framePath } from '@/shared/lib/frame-path';
import { colors } from '@/shared/lib/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** One line takes this long around the card; the other is half a lap behind. */
const LAP_MS = 6000;
/** Each line's share of the outline. */
const DASH = 0.16;
/** On the card's 18pt corner, 1pt in from its edge. */
const RADIUS = 17;
const INSET = 1;
/** Room past the card's edge for the widest stroke. */
const PAD = 10;
/** The wide faint strokes make the light, the thin one on top the line. */
const STROKES = [
  { width: 18, opacity: 0.05 },
  { width: 11, opacity: 0.09 },
  { width: 6, opacity: 0.18 },
  { width: 2.5, opacity: 1 },
];

interface ChaseStrokeProps {
  d: string;
  length: number;
  progress: SharedValue<number>;
  width: number;
  opacity: number;
}

/** Both lines in one stroke, half an outline apart, so half a lap looks the same as a whole one. */
function ChaseStroke({ d, length, progress, width, opacity }: ChaseStrokeProps) {
  const dash = length * DASH;
  const gap = length / 2 - dash;
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: (length / 2) * (1 - progress.get()),
  }));
  return (
    <AnimatedPath
      d={d}
      fill="none"
      stroke={colors.accent}
      strokeOpacity={opacity}
      strokeWidth={width}
      strokeLinecap="round"
      strokeDasharray={[dash, gap, dash, gap]}
      animatedProps={animatedProps}
    />
  );
}

/** Two neon lines chasing each other around the parent's edge, their light falling past it. */
export function ChaseBorder() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.set(
      withRepeat(withTiming(1, { duration: LAP_MS / 2, easing: Easing.linear }), -1, false),
    );
    return () => cancelAnimation(progress);
  }, [progress]);

  const width = size.width + PAD * 2;
  const height = size.height + PAD * 2;
  const { d, length } = framePath(width, height, RADIUS, PAD + INSET);
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      onLayout={(e) => setSize(e.nativeEvent.layout)}
      className="absolute inset-0"
    >
      {size.width > 0 ? (
        <Svg width={width} height={height} style={{ position: 'absolute', left: -PAD, top: -PAD }}>
          {STROKES.map((stroke) => (
            <ChaseStroke
              key={stroke.width}
              d={d}
              length={length}
              progress={progress}
              width={stroke.width}
              opacity={stroke.opacity}
            />
          ))}
        </Svg>
      ) : null}
    </Animated.View>
  );
}
