import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { type UnitSystem, weightUnit } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { Sparkline } from '@/shared/ui/sparkline';
import { Text } from '@/shared/ui/text';

import { formatChange } from '../lib/format';
import type { TrendChange } from '../lib/trend';

/** The sparkline spans at least this many kg, so a tiny change stays a gentle slope. */
const MIN_SPAN_KG = 0.3;

export interface TrendChangeRowProps {
  change: TrendChange;
  units: UnitSystem;
}

/** "7 Tage", the trend's sparkline and how much it moved (GW·2, Veränderung · Trend). */
export function TrendChangeRow({ change, units }: TrendChangeRowProps) {
  const { t } = useTranslation('weight');
  const value = formatChange(change.changeKg, units);
  const unit = weightUnit(units);
  // Neutral: whether down is good depends on the user's goal.
  const direction = value.startsWith('−')
    ? 'trend-down'
    : value.startsWith('+')
      ? 'trend-up'
      : null;
  return (
    <View className="h-14.5 flex-row items-center px-5">
      <Text variant="label" className="flex-1">
        {t('history.days', { count: change.days })}
      </Text>
      <Sparkline series={change.series} minSpan={MIN_SPAN_KG} />
      {/* Sits 3pt above the row's middle, as in the design. */}
      <View className="mb-1.5 w-25 items-end">
        <Text variant="label" className="leading-5 tabular-nums">
          {`${value} ${unit}`}
        </Text>
        <View className="mt-1.25 h-2">
          {direction ? <Icon name={direction} size={14} color={colors.muted} /> : null}
        </View>
      </View>
    </View>
  );
}
