import { View } from 'react-native';
import Animated, { type CSSAnimationKeyframes } from 'react-native-reanimated';

const RIPPLE: CSSAnimationKeyframes = {
  from: { transform: [{ scale: 0.55 }], opacity: 0.8 },
  to: { transform: [{ scale: 1.7 }], opacity: 0 },
};

/** A soft neon halo that grows and settles behind the mark. */
const BREATHE: CSSAnimationKeyframes = {
  '0%': { transform: [{ scale: 1.1 }], opacity: 0.32 },
  '50%': { transform: [{ scale: 1.5 }], opacity: 0.2 },
  '100%': { transform: [{ scale: 1.1 }], opacity: 0.32 },
};

/** The diamond turns half a turn and rests, twice per cycle. */
const TURN: CSSAnimationKeyframes = {
  '0%': { transform: [{ rotate: '45deg' }] },
  '50%': { transform: [{ rotate: '225deg' }] },
  '100%': { transform: [{ rotate: '405deg' }] },
};

/** "think": rings and a quick turn while an answer comes; "breathe": a calm halo at rest. */
export type CoachMarkAnimation = 'think' | 'breathe';

/** How long one turn of the diamond takes in each. */
const TURN_DURATION = { think: '1.6s', breathe: '2.4s' } as const;

export interface CoachMarkProps {
  /** 28 beside an answer, 44 on the start screen. */
  size?: number;
  animation?: CoachMarkAnimation;
  /** Each step turns the diamond half a turn (the card's question changing). */
  turns?: number;
}

/** The coach's avatar: a dark diamond on neon (design "Coach Screens"). */
export function CoachMark({ size = 28, animation, turns = 0 }: CoachMarkProps) {
  // 9pt on the 28pt mark, 14pt on the 44pt one.
  const diamond = Math.round(size * 0.32);
  return (
    <View style={{ width: size, height: size }}>
      {animation === 'think'
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
      {animation === 'breathe' ? (
        <Animated.View
          pointerEvents="none"
          className="absolute inset-0 rounded-full bg-accent"
          style={{
            animationName: BREATHE,
            animationDuration: '2.4s',
            animationIterationCount: 'infinite',
            animationTimingFunction: 'ease-in-out',
          }}
        />
      ) : null}
      <View className="flex-1 items-center justify-center rounded-full bg-accent">
        <Animated.View
          className="rounded-[2px] bg-bg"
          style={[
            {
              width: diamond,
              height: diamond,
              transform: [{ rotate: `${45 + turns * 180}deg` }],
              transitionProperty: 'transform',
              transitionDuration: '0.6s',
              transitionTimingFunction: 'ease-in-out',
            },
            animation && {
              animationName: TURN,
              animationDuration: TURN_DURATION[animation],
              animationIterationCount: 'infinite',
              animationTimingFunction: 'ease-in-out',
            },
          ]}
        />
      </View>
    </View>
  );
}
