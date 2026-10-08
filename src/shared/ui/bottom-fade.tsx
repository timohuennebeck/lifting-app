import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { colors } from '@/shared/lib/theme';

export interface BottomFadeProps {
  children: ReactNode;
}

/** Sticky bottom CTA area that fades the scrolling content out underneath it. */
export function BottomFade({ children }: BottomFadeProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      pointerEvents="box-none"
      className="absolute inset-x-0 bottom-0 px-4 pt-10"
      style={{ paddingBottom: insets.bottom + 16 }}
    >
      <Svg
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
