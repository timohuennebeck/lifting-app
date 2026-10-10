import { ScrollView } from 'react-native';

import type { MuscleShare } from '@/shared/data/muscles';

import { MuscleTile } from './muscle-tile';

export interface MuscleTileRowProps {
  shares: MuscleShare[];
}

/** Horizontally scrolling row of muscle tiles ("Muscles worked"). */
export function MuscleTileRow({ shares }: MuscleTileRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 px-4"
    >
      {/* Sorted by share: the first is the muscle worked most. */}
      {shares.map((s, i) => (
        <MuscleTile key={s.muscle} muscle={s.muscle} percent={s.percent} highlight={i === 0} />
      ))}
    </ScrollView>
  );
}
