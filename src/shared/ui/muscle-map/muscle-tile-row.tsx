import { ScrollView } from 'react-native';

import type { MuscleShare } from '@/shared/data/muscles';

import { MuscleTile } from './muscle-tile';

export interface MuscleTileRowProps {
  /** In neon, first. */
  primary: MuscleShare[];
  /** In grey, after the primary ones. */
  secondary: MuscleShare[];
}

/** Horizontally scrolling row of muscle tiles ("Beanspruchte Muskeln"). */
export function MuscleTileRow({ primary, secondary }: MuscleTileRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 px-4"
    >
      {primary.map((s) => (
        <MuscleTile key={s.muscle} muscle={s.muscle} percent={s.percent} highlight />
      ))}
      {secondary.map((s) => (
        <MuscleTile key={s.muscle} muscle={s.muscle} percent={s.percent} />
      ))}
    </ScrollView>
  );
}
