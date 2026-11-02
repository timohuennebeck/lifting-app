import { View } from 'react-native';
import Animated, { type CSSAnimationKeyframes } from 'react-native-reanimated';

const RIPPLE: CSSAnimationKeyframes = {
  from: { transform: [{ scale: 0.55 }], opacity: 0.8 },
  to: { transform: [{ scale: 1.7 }], opacity: 0 },
};

/** The diamond turns half a turn and rests, twice per cycle. */
const TURN: CSSAnimationKeyframes = {
  '0%': { transform: [{ rotate: '45deg' }] },
  '50%': { transform: [{ rotate: '225deg' }] },
  '100%': { transform: [{ rotate: '405deg' }] },
};

export interface CoachMarkProps {
  /** 28 beside an answer, 44 on the start screen. */
  size?: number;
  /** While the coach works on an answer: ripples, and the diamond turns. */
  thinking?: boolean;
}

/** The coach's avatar: a dark diamond on neon (design "Coach Screens"). */
export function CoachMark({ size = 28, thinking = false }: CoachMarkProps) {
  // 9pt on the 28pt mark, 14pt on the 44pt one.
  const diamond = Math.round(size * 0.32);
  return (
    <View style={{ width: size, height: size }}>
      {thinking
        ? [0, 0.8].map((delay) => (
            <Animated.View
              key={delay}
              pointerEvents="none"
              className="absolute inset-0 rounded-full border-[1.5px] border-accent"
              style={{
                animationName: RIPPLE,
                animationDuration: '1.6s',
                animationDelay: `${delay}s`,
                animationIterationCount: 'infinite',
                animationTimingFunction: 'ease-out',
                animationFillMode: 'backwards',
              }}
            />
          ))
        : null}
      <View className="flex-1 items-center justify-center rounded-full bg-accent">
        <Animated.View
          className="rounded-[2px] bg-bg"
          style={[
            { width: diamond, height: diamond, transform: [{ rotate: '45deg' }] },
            thinking && {
              animationName: TURN,
              animationDuration: '1.6s',
              animationIterationCount: 'infinite',
              animationTimingFunction: 'ease-in-out',
            },
          ]}
        />
      </View>
    </View>
  );
}
