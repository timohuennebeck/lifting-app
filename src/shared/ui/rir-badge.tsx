import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { formatRir, rirColor } from '@/shared/lib/rir';

import { Text } from './text';

export interface RirBadgeProps {
  rir: number;
  size?: number;
  /** Dimmed, e.g. a target not picked yet; still opaque, so a focus ring under it stays hidden. */
  faded?: boolean;
  className?: string;
}

/** Round reps-in-reserve marker, amber or red when close to failure. */
export function RirBadge({ rir, size = 22, faded, className }: RirBadgeProps) {
  return (
    <View
      className={cn('rounded-full', faded && 'bg-bg', className)}
      style={{ width: size, height: size }}
    >
      <View
        className={cn('flex-1 items-center justify-center rounded-full', faded && 'opacity-40')}
        style={{ backgroundColor: rirColor(rir) }}
      >
        <Text variant="caption" tone="onAccent" className="font-inter-bold text-xs leading-3.5">
          {formatRir(rir)}
        </Text>
      </View>
    </View>
  );
}
