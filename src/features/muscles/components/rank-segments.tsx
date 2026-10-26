import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';

const SEGMENTS = 20;

/**
 * How many of a rank's segments `level` fills: all once past it (or at 100), none before it, and
 * never all while still in it, so its last level doesn't look like the next rank.
 */
export function filled(level: number, from: number, to: number) {
  if (level > to || level >= 100) return SEGMENTS;
  if (level < from) return 0;
  return Math.min(SEGMENTS - 1, Math.round(((level - from + 1) / (to - from + 1)) * SEGMENTS));
}

/** A rank's levels as a row of segments, the first `lit` of them filled. */
export function RankSegments({ lit, className }: { lit: number; className?: string }) {
  return (
    <View className={cn('flex-row gap-1', className)}>
      {Array.from({ length: SEGMENTS }, (_, i) => (
        <View
          key={i}
          className={cn('h-full flex-1 rounded-full', i < lit ? 'bg-accent' : 'bg-control')}
        />
      ))}
    </View>
  );
}
