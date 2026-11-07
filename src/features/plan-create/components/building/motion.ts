import type { CSSAnimationKeyframes } from 'react-native-reanimated';

type Timing = 'ease-in-out' | 'ease-out' | 'linear';

/** An endless CSS animation of `seconds` per cycle, from `delay` on. */
export const loop = (
  name: CSSAnimationKeyframes,
  seconds: number,
  delay = 0,
  timing: Timing = 'ease-in-out',
) => ({
  animationName: name,
  animationDuration: `${seconds}s` as const,
  animationDelay: `${delay}s` as const,
  animationIterationCount: 'infinite' as const,
  animationTimingFunction: timing,
});

/** A gentle bob up and down. */
export const FLOAT: CSSAnimationKeyframes = {
  '0%': { transform: [{ translateY: 0 }] },
  '50%': { transform: [{ translateY: -8 }] },
  '100%': { transform: [{ translateY: 0 }] },
};

/** Popping in, a little past its size and back. */
export const POP: CSSAnimationKeyframes = {
  '0%': { opacity: 0, transform: [{ scale: 0.3 }] },
  '60%': { opacity: 1, transform: [{ scale: 1.12 }] },
  '100%': { opacity: 1, transform: [{ scale: 1 }] },
};

/** What every building variant is shown. */
export interface BuildingVariantProps {
  /** Seconds since the screen opened. */
  seconds: number;
  /** What is being done right now; changes every few seconds. */
  line: string;
  /** "12 s", the time waited so far. */
  elapsed: string;
  /** The user's answers: goal, frequency, equipment, focus. */
  chips: readonly [string, string, string, string];
  /** Routine badges: "W1", "W2", … */
  tags: readonly string[];
}
