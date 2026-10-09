import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { formatRir, rirColor } from '@/shared/lib/rir';

import { Text } from './text';

export interface RirBadgeProps {
  rir: number;
  size?: number;
  className?: string;
}

/** Round reps-in-reserve marker, amber or red when close to failure. */
export function RirBadge({ rir, size = 22, className }: RirBadgeProps) {
  return (
    <View
      className={cn('items-center justify-center rounded-full', className)}
      style={{ width: size, height: size, backgroundColor: rirColor(rir) }}
    >
      <Text variant="caption" tone="onAccent" className="font-inter-bold text-xs leading-3.5">
        {formatRir(rir)}
      </Text>
    </View>
  );
}
