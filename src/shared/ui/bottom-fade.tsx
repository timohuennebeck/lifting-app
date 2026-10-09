import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useFooterInset } from '@/shared/hooks/use-footer-inset';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';

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
      <Svg
        width="100%"
        height="100%"
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <Defs>
          <LinearGradient id="cta-fade" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0" stopColor={colors.bg} stopOpacity={1} />
            <Stop offset="0.55" stopColor={colors.bg} stopOpacity={1} />
            <Stop offset="1" stopColor={colors.bg} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#cta-fade)" />
      </Svg>
      {children}
    </View>
  );
}
