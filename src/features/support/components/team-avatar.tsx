import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';

export interface TeamAvatarProps {
  size?: number;
  /** Accent fill; otherwise a muted glass circle (read tickets). */
  highlight?: boolean;
}

/** The Loqqa team's badge used in the chat and ticket rows: the logo's mark in a circle. */
export function TeamAvatar({ size = 28, highlight = true }: TeamAvatarProps) {
  // The mark's two blocks from assets/brand/loqqa-app-icon.svg (its 300-unit grid), half as tall
  // as the circle.
  const height = size * 0.5;
  const fill = highlight ? colors.onAccent : colors.muted;
  return (
    <View
      className={cn(
        'items-center justify-center rounded-full',
        highlight ? 'bg-accent' : 'bg-white/10',
      )}
      style={{ width: size, height: size }}
    >
      <Svg width={(height * 138) / 196} height={height} viewBox="84 52 138 196">
        <Rect x={84} y={52} width={72} height={126} fill={fill} />
        <Rect x={84} y={192} width={138} height={56} fill={fill} />
      </Svg>
    </View>
  );
}
