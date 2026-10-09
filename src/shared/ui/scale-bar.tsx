import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { clamp } from '@/shared/lib/math';

export interface ScaleBarProps {
  /** Marker position, 0–1. */
  position: number;
  /** Grey marker instead of the accent one (older entries). */
  muted?: boolean;
}

/** Four-segment scale with a round marker (body-check metrics and history). */
export function ScaleBar({ position, muted }: ScaleBarProps) {
  return (
    <View className="h-2 flex-row gap-0.75">
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          className={cn('flex-1 bg-control', i === 0 && 'rounded-l', i === 3 && 'rounded-r')}
        />
      ))}
      <View
        className={cn(
          'absolute -top-1.75 -ml-2.75 size-5.5 rounded-full border-[3px] border-bg',
          muted ? 'bg-subtle' : 'bg-accent',
        )}
        style={{ left: `${clamp(position, 0, 1) * 100}%` }}
      />
    </View>
  );
}
