import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { Text } from '@/shared/ui/text';

export interface TeamAvatarProps {
  size?: number;
  /** Accent fill; otherwise a muted glass circle (read tickets). */
  highlight?: boolean;
}

/** The Forge team's "F" badge used in the chat and ticket rows. */
export function TeamAvatar({ size = 28, highlight = true }: TeamAvatarProps) {
  // 22 → 12pt, 28 → 13pt, 40 → 15pt as in the design.
  const fontSize = Math.round(9 + size * 0.15);
  return (
    <View
      className={cn(
        'items-center justify-center rounded-full',
        highlight ? 'bg-accent' : 'bg-white/10',
      )}
      style={{ width: size, height: size }}
    >
      <Text
        variant="label"
        tone={highlight ? 'onAccent' : 'muted'}
        style={{ fontSize, lineHeight: fontSize + 4 }}
      >
        F
      </Text>
    </View>
  );
}
