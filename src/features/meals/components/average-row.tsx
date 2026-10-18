import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Sparkline } from '@/shared/ui/sparkline';
import { Text } from '@/shared/ui/text';

import { formatGrams, formatKcal, KCAL } from '../lib/format';
import type { PeriodAverage } from '../lib/intake';

/** The sparkline spans at least this many kcal, so a steady stretch stays a gentle slope. */
const MIN_SPAN_KCAL = 150;

export interface AverageRowProps {
  average: PeriodAverage;
}

/** "7 Tage", the average line's sparkline, the average day's kcal and its protein (whole g). */
export function AverageRow({ average }: AverageRowProps) {
  const { t } = useTranslation('meals');
  return (
    <View className="h-14.5 flex-row items-center px-5">
      <Text variant="label" className="flex-1">
        {t('trend.days', { count: average.days })}
      </Text>
      <Sparkline series={average.series} minSpan={MIN_SPAN_KCAL} />
      <View className="w-27 items-end">
        <Text variant="label" className="leading-5 tabular-nums">
          {`${formatKcal(average.kcal)} ${KCAL}`}
        </Text>
        {average.proteinG !== null ? (
          <Text
            tone="muted"
            numberOfLines={1}
            className="font-inter-medium text-xs leading-4 tabular-nums"
          >
            {t('trend.protein', { value: formatGrams(Math.round(average.proteinG)) })}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
