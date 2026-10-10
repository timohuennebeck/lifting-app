import type { ReactNode } from 'react';
import Animated, { type AnimatedProps } from 'react-native-reanimated';

import { useFooterInset } from '@/shared/hooks/use-footer-inset';
import { cn } from '@/shared/lib/cn';

import { Gradient, type GradientStop } from './gradient';

const FADE: GradientStop[] = [
  [0, 1],
  [0.55, 1],
  [1, 0],
];

export interface BottomFadeProps {
  children: ReactNode;
  className?: string;
  /** Space under the CTA; defaults to the safe-area footer inset. */
  bottomInset?: number;
  /** Animates the area in when it mounts, e.g. `FadeIn`. */
  entering?: AnimatedProps<object>['entering'];
}

/** Sticky bottom CTA area that fades the scrolling content out underneath it. */
export function BottomFade({ children, className, bottomInset, entering }: BottomFadeProps) {
  const footerInset = useFooterInset();
  return (
    <Animated.View
      pointerEvents="box-none"
      entering={entering}
      className={cn('absolute inset-x-0 bottom-0 px-4 pt-10', className)}
      style={{ paddingBottom: bottomInset ?? footerInset }}
    >
      <Gradient from="bottom" stops={FADE} />
      {children}
    </Animated.View>
  );
}
