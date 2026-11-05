import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { MUSCLE_IDS, MuscleCrop, type MuscleId } from '@/shared/ui/muscle-map';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import type { MuscleCount } from '../lib/muscle-sets';

// Stable `selected` arrays, so the memoized crop skips re-rendering with its row.
const ONLY = Object.fromEntries(MUSCLE_IDS.map((m) => [m, [m]])) as Record<MuscleId, MuscleId[]>;
const NONE: MuscleId[] = [];

export interface MuscleSetRowProps {
  muscle: MuscleId;
  count: MuscleCount | undefined;
  /** The most sets of any muscle: its bar fills the row. */
  max: number;
  onPress: (muscle: MuscleId) => void;
}

/**
 * A muscle on the Sätze tab: its crop of the body map, name and sets, and a bar split into
 * primary (neon) and secondary (grey) sets. Untrained, all of it is grey with 0.
 */
export const MuscleSetRow = memo(function MuscleSetRow({
  muscle,
  count,
  max,
  onPress,
}: MuscleSetRowProps) {
  const { t } = useTranslation('muscles');
  const name = t(`names.${muscle}`);
  const total = count?.total ?? 0;
  const primary = count?.primary ?? 0;
  const secondary = count?.secondary ?? 0;
  const lit = total ? ONLY[muscle] : NONE;

  return (
    <PressableScale
      haptic="tap"
      activeScale={0.98}
      accessibilityLabel={t('sets.rowA11y', { muscle: name, total, primary, secondary })}
      onPress={() => onPress(muscle)}
      className="flex-row items-center gap-3.5 px-4 py-2.5"
    >
      <View className="size-11 overflow-hidden rounded-full bg-elevated">
        <MuscleCrop muscle={muscle} selected={lit} accent={primary ? undefined : colors.fg2} />
      </View>
      <View className="min-w-0 flex-1 gap-2">
        <View className="flex-row items-baseline justify-between gap-3">
          <Text variant="label" numberOfLines={1} className={cn('shrink', !total && 'text-dim')}>
            {name}
          </Text>
          <Text variant="label" className={cn('tabular-nums', !total && 'text-dim')}>
            {total}
          </Text>
        </View>
        <View className="h-1.5 rounded-full bg-control">
          {total ? (
            <View className="h-full flex-row gap-0.5" style={{ width: `${(total / max) * 100}%` }}>
              {primary ? (
                <View className="h-full rounded-full bg-accent" style={{ flex: primary }} />
              ) : null}
              {secondary ? (
                <View className="h-full rounded-full bg-fg-2" style={{ flex: secondary }} />
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    </PressableScale>
  );
});
