import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';

import { RirBadge } from './rir-badge';
import { Text } from './text';

export interface NumberedSetProps {
  /** Its number in the exercise, from 1. */
  number: number;
  /** Reps in reserve, as a badge at the end; none without. */
  rir: number | null;
  /** The taller lines of an exercise's history. */
  large?: boolean;
  /** What the set is, between the number and the badge; it takes the width (`flex-1`). */
  children: ReactNode;
}

/** A set on one line: its number in a circle, what it is, and its reps in reserve. */
export function NumberedSet({ number, rir, large = false, children }: NumberedSetProps) {
  return (
    <View className={cn('flex-row items-center', large ? 'h-11 gap-3' : 'gap-2.5')}>
      <View
        className={cn(
          'items-center justify-center rounded-full bg-elevated',
          large ? 'size-7' : 'size-6',
        )}
      >
        <Text variant="caption" className={large ? 'tabular-nums' : 'text-xs'}>
          {number}
        </Text>
      </View>
      {children}
      {rir != null ? <RirBadge rir={rir} size={large ? 24 : undefined} /> : null}
    </View>
  );
}
