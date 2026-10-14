import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';

export interface SessionProgressProps {
  /** Workouts done this plan week. */
  done: number;
  /** The plan's weekly goal. */
  total: number;
}

/** One segment per workout of the plan week, the done ones in accent. */
export function SessionProgress({ done, total }: SessionProgressProps) {
  return (
    <View className="flex-row gap-1" accessibilityElementsHidden importantForAccessibility="no">
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          className={cn('h-1.5 flex-1 rounded-full', i < done ? 'bg-accent' : 'bg-control')}
        />
      ))}
    </View>
  );
}
