import { View } from 'react-native';
import Animated, { type CSSAnimationKeyframes } from 'react-native-reanimated';

import { colors } from '@/shared/lib/theme';

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

export interface CoachDiamondProps {
  size: number;
  color?: string;
  animation?: CoachMarkAnimation;
  /** Each step turns the diamond half a turn (the card's question changing). */
  turns?: number;
}

/** The diamond of the coach's mark, for a circle of its own too. */
export function CoachDiamond({ size, color = colors.bg, animation, turns = 0 }: CoachDiamondProps) {
  return (
    <Animated.View
      className="rounded-[2px]"
      style={[
        {
          width: size,
          height: size,
          backgroundColor: color,
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
  );
}

export interface CoachMarkProps {
  /** 28 beside an answer, 52 on the Training tab's card. */
  size?: number;
  animation?: CoachMarkAnimation;
  /** Each step turns the diamond half a turn (the card's question changing); it rests between. */
  turns?: number;
}

/** The coach's avatar: a dark diamond on neon (design "Coach Screens"). */
export function CoachMark({ size = 28, animation, turns }: CoachMarkProps) {
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
        {/* 9pt on the 28pt mark, 17pt on the 52pt one. */}
        <CoachDiamond
          size={Math.round(size * 0.32)}
          animation={turns === undefined ? animation : undefined}
          turns={turns}
        />
      </View>
    </View>
  );
}
