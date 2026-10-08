import { View } from 'react-native';

import { GhostExercise } from '@/shared/ui/ghost-exercise';
import { Text } from '@/shared/ui/text';

export interface EmptyExercisesProps {
  hint: string;
}

/** Ghost exercise rows with a hint, shown while a training has no exercises (03·0 leer). */
export function EmptyExercises({ hint }: EmptyExercisesProps) {
  return (
    <View>
      <GhostExercise menu widths={['88%', '58%']} />
      <GhostExercise menu faded widths={['74%', '44%']} />
      <Text variant="paragraph" tone="subtle" className="px-2.5 pt-2 text-center text-sm">
        {hint}
      </Text>
    </View>
  );
}
