import { View } from 'react-native';
import Animated, { type CSSAnimationKeyframes } from 'react-native-reanimated';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';

/** Each letter lights up this long after the one before. */
const LETTER_MS = 30;

/** A letter brightens and fades back early in each flash. */
const FLASH: CSSAnimationKeyframes = {
  '0%': { color: colors.subtle },
  '6%': { color: colors.fg },
  '18%': { color: colors.subtle },
  '100%': { color: colors.subtle },
};

export interface FlashTextProps {
  text: string;
  /** One flash and the rest until the next. */
  periodMs: number;
  /** Rests while paused, e.g. behind another tab. */
  paused?: boolean;
  /** The letters' font and size. */
  className?: string;
}

/** A line with a light running across it from left to right, again and again. */
export function FlashText({ text, periodMs, paused = false, className }: FlashTextProps) {
  return (
    <View className="flex-row overflow-hidden" importantForAccessibility="no-hide-descendants">
      {Array.from(text).map((letter, i) => (
        <Animated.Text
          key={i}
          className={cn('font-inter', className)}
          style={{
            color: colors.subtle,
            animationName: FLASH,
            animationDuration: `${periodMs}ms`,
            animationDelay: `${i * LETTER_MS}ms`,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear',
            animationPlayState: paused ? 'paused' : 'running',
          }}
        >
          {letter}
        </Animated.Text>
      ))}
    </View>
  );
}
