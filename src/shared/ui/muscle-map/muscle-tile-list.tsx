import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { MuscleShare } from '@/shared/data/muscles';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';

import { PressableScale } from '../pressable-scale';
import { Text } from '../text';
import { MuscleCircle } from './muscle-circle';
import { MuscleTile } from './muscle-tile';

/** Tiles shown before the rest fold into a "+N" pill. */
const SHOWN = 3;
/** Circles of folded muscles drawn overlapping on the pill. */
const STACKED = 3;

export interface MuscleTileListProps {
  shares: MuscleShare[];
  /** In neon (primary muscles); grey otherwise. */
  highlight?: boolean;
  /** Layout of the tiles, e.g. a wrapping row or a column. */
  className?: string;
}

/**
 * Muscle tiles, at most three: the others fold into a pill with their circles overlapping and
 * "+N", which shows them all.
 */
export function MuscleTileList({ shares, highlight, className }: MuscleTileListProps) {
  const { t } = useTranslation('muscles');
  const [open, setOpen] = useState(false);
  const folded = open ? [] : shares.slice(SHOWN);
  const shown = folded.length ? shares.slice(0, SHOWN) : shares;
  if (!shares.length) return null;

  return (
    <View className={className}>
      {shown.map((s) => (
        <MuscleTile key={s.muscle} muscle={s.muscle} percent={s.percent} highlight={highlight} />
      ))}
      {folded.length ? (
        <PressableScale
          haptic="select"
          accessibilityRole="button"
          accessibilityLabel={t('breakdown.showMore', { count: folded.length })}
          onPress={() => setOpen(true)}
          // As tall as a tile: same padding around the same 46pt circles.
          className="flex-row items-center gap-2.5 self-start rounded-full border-[1.5px] border-transparent bg-tile py-0.5 pr-5 pl-0.75"
        >
          <View className="flex-row">
            {folded.slice(0, STACKED).map((s, i) => (
              <MuscleCircle
                key={s.muscle}
                muscle={s.muscle}
                accent={highlight ? colors.accent : colors.fg2}
                // Each overlaps the one before, outlined in the pill's colour.
                className={cn('size-11.5 border-2 border-tile', i > 0 && '-ml-5')}
              />
            ))}
          </View>
          <Text variant="label" className="text-fg-mid">{`+${folded.length}`}</Text>
        </PressableScale>
      ) : null}
    </View>
  );
}
