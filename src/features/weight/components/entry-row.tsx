import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { type UnitSystem, weightUnit } from '@/shared/lib/format';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { SwipeToDelete } from '@/shared/ui/swipe-to-delete';
import { Text } from '@/shared/ui/text';

import { formatBodyWeight, formatChange } from '../lib/format';
import { offTrend, type WeightPoint } from '../lib/trend';

export interface EntryRowProps {
  point: WeightPoint;
  units: UnitSystem;
  dayLabel: (iso: string) => string;
  onPress: () => void;
  onDelete: () => void;
}

/** A weigh-in: its day and distance to the trend, the weight, the trend and the change (GW·2). */
export function EntryRow({ point, units, dayLabel, onPress, onDelete }: EntryRowProps) {
  const { t } = useTranslation('weight');
  const off = offTrend(point);
  const distance = `${formatBodyWeight(Math.abs(off), units)} ${weightUnit(units)}`;
  return (
    <SwipeToDelete label={t('history.delete')} onDelete={onDelete}>
      <PressableScale
        activeScale={0.98}
        onPress={onPress}
        className="h-15.5 flex-row items-center bg-bg px-5"
      >
        <View className="min-w-0 flex-1 gap-px pt-0.5">
          <Text className="font-inter-semibold text-[15px] leading-5" numberOfLines={1}>
            {dayLabel(point.date)}
          </Text>
          <Text
            className={`font-inter-medium text-xs leading-4 ${off === 0 ? 'text-accent' : 'text-subtle'}`}
            numberOfLines={1}
          >
            {off === 0
              ? t('history.onTrend')
              : t(off < 0 ? 'history.belowTrend' : 'history.aboveTrend', { value: distance })}
          </Text>
        </View>
        <Text variant="label" className="mt-1 w-18 text-right tabular-nums">
          {formatBodyWeight(point.weightKg, units)}
        </Text>
        <Text variant="label" tone="accent" className="mt-1 w-18 text-right tabular-nums">
          {formatBodyWeight(point.trendKg, units)}
        </Text>
        <Text
          tone="subtle"
          className="mt-1 w-13.5 text-right font-inter-medium text-[13px] tabular-nums"
        >
          {point.changeKg === null ? '' : formatChange(point.changeKg, units)}
        </Text>
      </PressableScale>
    </SwipeToDelete>
  );
}
