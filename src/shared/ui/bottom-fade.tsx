import type { ReactNode } from 'react';
import { View } from 'react-native';

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
}

/** Sticky bottom CTA area that fades the scrolling content out underneath it. */
export function BottomFade({ children, className, bottomInset }: BottomFadeProps) {
  const footerInset = useFooterInset();
  return (
    <View
      pointerEvents="box-none"
      className={cn('absolute inset-x-0 bottom-0 px-4 pt-10', className)}
      style={{ paddingBottom: bottomInset ?? footerInset }}
    >
      <Gradient from="bottom" stops={FADE} />
      {children}
    </View>
  );
}
