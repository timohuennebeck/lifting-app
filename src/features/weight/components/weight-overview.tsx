import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { formatShortDate, type UnitSystem, weightUnit } from '@/shared/lib/format';
import { type Period, PERIOD_DAYS } from '@/shared/lib/periods';
import { RangeTabs } from '@/shared/ui/range-tabs';
import { Text } from '@/shared/ui/text';

import { formatBodyWeight, formatChange } from '../lib/format';
import { daysBefore, trendOn, type WeightPoint } from '../lib/trend';
import { WeightChart } from './weight-chart';

/** Section and value labels: 12pt caps, set 1pt lower than their line box like the design's. */
export const OVERLINE = 'relative top-px text-xs leading-4 tracking-[1.65px]';

export interface WeightOverviewProps {
  /** Every weigh-in with its trend, oldest first. */
  points: WeightPoint[];
  today: string;
  units: UnitSystem;
}

/**
 * The trend and its change over the chosen period, the chart and the period tabs (GW·2). The period
 * and the picked weigh-in are kept here: a finger on the chart updates this and not the list of
 * weigh-ins under it.
 */
export function WeightOverview({ points, today, units }: WeightOverviewProps) {
  const { t } = useTranslation('weight');
  const unit = weightUnit(units);
  const [period, setPeriod] = useState<Period>('1m');
  // The picked weigh-in by its day, so deleting another one or a new day doesn't move it.
  const [pickedDate, setPickedDate] = useState<string | null>(null);

  const days = PERIOD_DAYS[period];
  // All: from the first weigh-in.
  const from = days === null ? (points[0]?.date ?? today) : daysBefore(today, days - 1);
  const visible = useMemo(
    () => points.filter((p) => p.date >= from && p.date <= today),
    [points, from, today],
  );
  const pickedIndex = visible.findIndex((p) => p.date === pickedDate);
  // A picked weigh-in that was deleted, or left the range, falls back to the latest.
  const selected = pickedIndex >= 0 ? pickedIndex : null;
  const shown = (selected === null ? undefined : visible[selected]) ?? visible.at(-1);
  const startTrend = trendOn(points, from) ?? visible[0]?.trendKg;

  const changePeriod = (next: Period) => {
    setPeriod(next);
    setPickedDate(null);
  };

  return (
    <>
      <View className="mt-4.25 flex-row gap-3 px-5">
        <View className="flex-1">
          <View className="flex-row items-center gap-1.5">
            <View className="h-0.75 w-3.5 rounded-full bg-accent" />
            <Text variant="overline" tone="muted" className={OVERLINE}>
              {t('history.trend')}
            </Text>
          </View>
          <View className="mt-0.75 flex-row items-baseline gap-1">
            <Text tone="accent" className="font-inter-semibold text-[41px] leading-11 tabular-nums">
              {shown ? formatBodyWeight(shown.trendKg, units) : '–'}
            </Text>
            <Text tone="muted" className="font-inter-semibold text-base">
              {unit}
            </Text>
          </View>
        </View>
        <View className="flex-1">
          <Text variant="overline" tone="muted" className={OVERLINE}>
            {t('history.difference')}
          </Text>
          <View className="mt-0.75 flex-row items-baseline gap-1">
            <Text className="font-inter-semibold text-[41px] leading-11 tabular-nums">
              {shown && startTrend !== undefined
                ? formatChange(shown.trendKg - startTrend, units)
                : '–'}
            </Text>
            <Text tone="muted" className="font-inter-semibold text-base">
              {unit}
            </Text>
          </View>
        </View>
      </View>
      <Text className="mt-2 h-5 px-5 font-inter-semibold text-[15px] leading-5">
        {visible.length && shown
          ? `${formatShortDate(`${visible[0].date}T12:00`)} – ${formatShortDate(`${shown.date}T12:00`)}`
          : ''}
      </Text>
      <View className="mt-2.25">
        <WeightChart
          points={visible}
          from={from}
          to={today}
          units={units}
          selected={selected}
          onSelect={(index) => setPickedDate(visible[index]?.date ?? null)}
        />
      </View>
      <RangeTabs value={period} onChange={changePeriod} className="mx-4 mt-5" />
    </>
  );
}
