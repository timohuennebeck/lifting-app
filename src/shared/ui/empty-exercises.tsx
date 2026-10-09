import { View } from 'react-native';

import { GhostExercise } from './ghost-exercise';
import { Text } from './text';

export interface EmptyExercisesProps {
  hint: string;
}

/** Ghost exercise rows with a hint, shown while a training has no exercises (03·0 leer). */
export function EmptyExercises({ hint }: EmptyExercisesProps) {
  return (
    <View>
      <GhostExercise widths={['88%', '58%']} />
      <GhostExercise faded widths={['74%', '44%']} />
      <Text variant="paragraph" tone="subtle" className="px-7.5 pt-2 text-center text-sm leading-5">
        {hint}
      </Text>
    </View>
  );
}
