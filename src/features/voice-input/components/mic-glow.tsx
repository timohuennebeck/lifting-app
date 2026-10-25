import { StyleSheet } from 'react-native';
import Animated, { type CSSAnimationKeyframes } from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';

const SIZE = 180;

const PULSE: CSSAnimationKeyframes = {
  '0%': { transform: [{ scale: 1 }] },
  '50%': { transform: [{ scale: 1.08 }] },
  '100%': { transform: [{ scale: 1 }] },
};

/** Neon microphone in a soft glow, the artwork while a spoken plan is put together. */
export function MicGlow() {
  return (
    <Animated.View
      className="items-center justify-center"
      style={{
        width: SIZE,
        height: SIZE,
        animationName: PULSE,
        animationDuration: '2.4s',
        animationIterationCount: 'infinite',
        animationTimingFunction: 'ease-in-out',
      }}
    >
      <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="mic-glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={colors.accent} stopOpacity={0.4} />
            <Stop offset="1" stopColor={colors.accent} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2} fill="url(#mic-glow)" />
      </Svg>
      <Icon name="mic" size={48} color={colors.accent} />
    </Animated.View>
  );
}
