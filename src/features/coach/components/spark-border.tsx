import { useEffect, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { framePath } from '@/shared/lib/frame-path';
import { colors } from '@/shared/lib/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** One lap round the card; the spark is this share of the outline. */
const LAP_MS = 7000;
const SPARK = 0.08;

/**
 * A small neon spark that runs round a card's faint outline, with a glow (the Kai card, version
 * D). Lies over the card; `radius` is the card's corner radius.
 */
export function SparkBorder({ radius }: { radius: number }) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const reduced = useReducedMotion();
  const lap = useSharedValue(0);
  const { d, length } = framePath(size.width, size.height, radius - 0.75, 0.75);

  useEffect(() => {
    if (reduced) return;
    lap.set(withRepeat(withTiming(1, { duration: LAP_MS, easing: Easing.linear }), -1));
    return () => cancelAnimation(lap);
  }, [lap, reduced]);

  const sparkProps = useAnimatedProps(() => ({ strokeDashoffset: -length * lap.get() }));
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  };

  const dash = [length * SPARK, length * (1 - SPARK)];
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={onLayout}>
      {size.width > 0 ? (
        <Svg width={size.width} height={size.height}>
          <Path d={d} fill="none" stroke={colors.fg} strokeOpacity={0.08} strokeWidth={1} />
          {reduced ? null : (
            <>
              <AnimatedPath
                d={d}
                fill="none"
                stroke={colors.accent}
                strokeOpacity={0.18}
                strokeWidth={4}
                strokeDasharray={dash}
                strokeLinecap="round"
                animatedProps={sparkProps}
              />
              <AnimatedPath
                d={d}
                fill="none"
                stroke={colors.accent}
                strokeWidth={1.4}
                strokeDasharray={dash}
                strokeLinecap="round"
                animatedProps={sparkProps}
              />
            </>
          )}
        </Svg>
      ) : null}
    </View>
  );
}
