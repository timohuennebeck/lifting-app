import { type StyleProp, View, type ViewStyle } from 'react-native';

import { cn } from '@/shared/lib/cn';

import type { MuscleId } from './body-paths';
import { MuscleCrop } from './muscle-map';

export interface MuscleCircleProps {
  /** The muscle lit on its crop of the body map; null: the chest's crop with nothing lit. */
  muscle: MuscleId | null;
  accent?: string;
  /** Size, border and place of the circle. */
  className?: string;
  style?: StyleProp<ViewStyle>;
}

/** A round crop of the body map with one muscle lit, e.g. the one a routine works most. */
export function MuscleCircle({ muscle, accent, className, style }: MuscleCircleProps) {
  return (
    <View className={cn('overflow-hidden rounded-full bg-elevated', className)} style={style}>
      <MuscleCrop muscle={muscle ?? 'chest'} selected={muscle ? [muscle] : []} accent={accent} />
    </View>
  );
}
