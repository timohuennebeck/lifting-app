import type { ReactNode } from 'react';
import { View } from 'react-native';

import { RirBadge } from './rir-badge';
import { Text } from './text';

export interface NumberedSetProps {
  /** Its number in the exercise, from 1. */
  number: number;
  /** Reps in reserve, as a badge at the end; none without. */
  rir: number | null;
  /** What the set is, between the number and the badge; it takes the width (`flex-1`). */
  children: ReactNode;
}

/** A set on one line: its number in a circle, what it is, and its reps in reserve. */
export function NumberedSet({ number, rir, children }: NumberedSetProps) {
  return (
    <View className="flex-row items-center gap-2.5">
      <View className="size-6 items-center justify-center rounded-full bg-elevated">
        <Text variant="caption" className="text-xs">
          {number}
        </Text>
      </View>
      {children}
      {rir != null ? <RirBadge rir={rir} /> : null}
    </View>
  );
}
