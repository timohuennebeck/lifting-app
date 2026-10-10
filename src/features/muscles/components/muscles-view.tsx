import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { MUSCLE_REGION, muscleShares } from '@/shared/data/muscles';
import { useMuscleVolume } from '@/shared/data/workouts';
import { cn } from '@/shared/lib/cn';
import { addDays, DAY_RANGES, type DayRange, startOfDay } from '@/shared/lib/date';
import { BodyMaps, MUSCLE_IDS, type MuscleId } from '@/shared/ui/muscle-map';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { MuscleShareTile } from './muscle-share-tile';

interface TileData {
  muscle: MuscleId;
  percent: number;
}

interface TileGridProps {
  tiles: TileData[];
  trained: boolean;
}

/** Two-column grid; an odd last tile keeps its half width. */
function TileGrid({ tiles, trained }: TileGridProps) {
  const rows = Array.from({ length: Math.ceil(tiles.length / 2) }, (_, i) =>
    tiles.slice(i * 2, i * 2 + 2),
  );
  return (
    <View className="gap-2 px-4 pt-2.5">
      {rows.map((row) => (
        <View key={row[0].muscle} className="flex-row gap-2">
          {row.map((tile) => (
            <MuscleShareTile key={tile.muscle} {...tile} trained={trained} />
          ))}
          {row.length === 1 ? <View className="flex-1" /> : null}
        </View>
      ))}
    </View>
  );
}

interface SectionLabelProps {
  label: string;
  first?: boolean;
}

function SectionLabel({ label, first }: SectionLabelProps) {
  return (
    <Text variant="overline" tone="subtle" className={cn('px-5', first ? 'pt-5.5' : 'pt-7')}>
      {label}
    </Text>
  );
}

/** Progress tab, "Muskeln": sets per muscle over 7, 30 or 90 days on body maps and tiles. */
export function MusclesView() {
  const { t } = useTranslation('muscles');
  const [range, setRange] = useState<DayRange>(30);
  // "Last 7 days" is today and the 6 days before. One query covers the longest range, so
  // switching ranges filters in memory instead of waiting for a new query.
  const today = startOfDay(new Date());
  const sinceIso = (days: number) => addDays(today, -(days - 1)).toISOString();
  const { data: volume } = useMuscleVolume(sinceIso(Math.max(...DAY_RANGES)));
  const rangeStart = sinceIso(range);

  const { upper, lower, untrained, totalSets, trainedIds } = useMemo(() => {
    const items = (volume ?? []).filter((v) => v.startedAt >= rangeStart);
    const shares = muscleShares(items);
    const trainedSet = new Set(shares.map((s) => s.muscle));
    return {
      upper: shares.filter((s) => MUSCLE_REGION[s.muscle] === 'upper'),
      lower: shares.filter((s) => MUSCLE_REGION[s.muscle] === 'lower'),
      untrained: MUSCLE_IDS.filter((m) => !trainedSet.has(m)).map((muscle) => ({
        muscle,
        percent: 0,
      })),
      totalSets: items.reduce((sum, i) => sum + i.sets, 0),
      trainedIds: shares.map((s) => s.muscle),
    };
  }, [volume, rangeStart]);

  return (
    <>
      <Text variant="paragraph" tone="subtle" className="px-5 pt-4">
        {t('subtitle', { days: range, count: totalSets })}
      </Text>
      <View className="flex-row gap-1.5 px-5 pt-4" accessibilityRole="tablist">
        {DAY_RANGES.map((r) => (
          <PressableScale
            key={r}
            haptic="select"
            accessibilityRole="tab"
            accessibilityState={{ selected: r === range }}
            onPress={() => setRange(r)}
            className={cn(
              'h-9 flex-1 items-center justify-center rounded-[18px]',
              r === range ? 'bg-accent' : 'bg-elevated',
            )}
          >
            <Text variant="caption" tone={r === range ? 'onAccent' : 'default'} className="text-sm">
              {t('range', { count: r })}
            </Text>
          </PressableScale>
        ))}
      </View>
      <BodyMaps selected={trainedIds} />
      {upper.length ? (
        <>
          <SectionLabel label={t('regions.upper')} first />
          <TileGrid tiles={upper} trained />
        </>
      ) : null}
      {lower.length ? (
        <>
          <SectionLabel label={t('regions.lower')} first={!upper.length} />
          <TileGrid tiles={lower} trained />
        </>
      ) : null}
      {untrained.length ? (
        <>
          <SectionLabel label={t('notTrained')} first={!upper.length && !lower.length} />
          <TileGrid tiles={untrained} trained={false} />
        </>
      ) : null}
    </>
  );
}
