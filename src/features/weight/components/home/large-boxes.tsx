import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useWidth } from '@/shared/hooks/use-width';
import { addDays, fromIsoDate, startOfWeek, toIsoDate } from '@/shared/lib/date';
import { cn } from '@/shared/lib/cn';
import { formatShortDate } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { changeOver, lastDays, weighInDots } from '../../lib/home-weight';
import { daysBefore } from '../../lib/trend';
import type { WeightBoxProps } from './compact-boxes';
import { ChangeText, Overline, WeightCard, WeightValue } from './parts';
import { TrendLine } from './trend-line';

/** Large 1, area chart: the trend over 30 days with the weigh-ins as dots, its dates below. */
export function LargeArea({ data, units }: WeightBoxProps) {
  const { t } = useTranslation('weight');
  const [width, onLayout] = useWidth();
  const series = lastDays(data.series, 30);
  return (
    <WeightCard className="gap-3 px-4 pt-4 pb-3.5">
      <View className="flex-row items-start justify-between">
        <View className="gap-1">
          <Overline>{t('home.title')}</Overline>
          <WeightValue kg={data.latest.trendKg} units={units} size={34} />
        </View>
        <View className="rounded-full bg-control px-3 py-1.5">
          <ChangeText
            kg={changeOver(data, 30)}
            units={units}
            suffix={t('history.days', { count: 30 })}
          />
        </View>
      </View>
      <View onLayout={onLayout}>
        <TrendLine series={series} dots={weighInDots(data, 30)} width={width} height={112} area />
      </View>
      <View className="flex-row justify-between">
        <Text className="font-inter text-xs text-subtle">
          {formatShortDate(fromIsoDate(daysBefore(data.today, series.length - 1)))}
        </Text>
        <Text className="font-inter text-xs text-subtle">{t('home.today')}</Text>
      </View>
    </WeightCard>
  );
}

const PERIODS = [
  { key: '1w', days: 7 },
  { key: '1m', days: 30 },
  { key: '3m', days: 90 },
] as const;

/** Large 2, periods: 1W, 1M and 3M to switch between, the change over the one picked. */
export function LargePeriods({ data, units }: WeightBoxProps) {
  const { t } = useTranslation(['weight', 'common']);
  const [width, onLayout] = useWidth();
  const [period, setPeriod] = useState(1);
  const { days } = PERIODS[period];
  return (
    <WeightCard className="gap-3 px-4 pt-4 pb-3.5">
      <View className="flex-row items-end justify-between">
        <View className="gap-1">
          <Overline>{t('weight:home.title')}</Overline>
          <WeightValue kg={data.latest.trendKg} units={units} size={34} />
        </View>
        <ChangeText kg={changeOver(data, days)} units={units} />
      </View>
      <View onLayout={onLayout}>
        <TrendLine
          series={lastDays(data.series, days)}
          dots={weighInDots(data, days)}
          width={width}
          height={104}
        />
      </View>
      <View className="flex-row gap-1 rounded-full bg-chip p-1">
        {PERIODS.map((p, i) => (
          <PressableScale
            key={p.key}
            haptic="tap"
            onPress={() => setPeriod(i)}
            className={cn(
              'h-7 flex-1 items-center justify-center rounded-full',
              i === period && 'bg-control',
            )}
          >
            <Text
              className={cn(
                'font-inter-semibold text-xs',
                i === period ? 'text-fg' : 'text-subtle',
              )}
            >
              {t(`common:periods.${p.key}`)}
            </Text>
          </PressableScale>
        ))}
      </View>
    </WeightCard>
  );
}

/** Large 3, weeks: the trend at the end of each of the last 8 weeks as bars, this week's in neon. */
export function LargeWeeks({ data, units }: WeightBoxProps) {
  const { t } = useTranslation('weight');
  const end = data.series.length - 1;
  const weeks = Array.from({ length: 8 }, (_, i) => data.series[end - 7 * (7 - i)] ?? null);
  const known = weeks.filter((w): w is number => w !== null);
  const lo = Math.min(...known) - 0.4;
  const hi = Math.max(...known);
  return (
    <WeightCard className="gap-4 px-4 pt-4 pb-3.5">
      <View className="flex-row items-end justify-between">
        <View className="gap-1">
          <Overline>{t('home.title')}</Overline>
          <WeightValue kg={data.latest.trendKg} units={units} size={34} />
        </View>
        <ChangeText kg={changeOver(data, 7)} units={units} suffix={t('home.thisWeek')} />
      </View>
      <View className="h-28 flex-row items-end gap-2">
        {weeks.map((kg, i) => (
          <View key={i} className="flex-1 items-center justify-end gap-1.5 self-stretch">
            {kg === null ? (
              <View className="h-1 w-full rounded-full bg-chip" />
            ) : (
              <View
                className={cn('w-full rounded-md', i === 7 ? 'bg-accent' : 'bg-control')}
                style={{ height: 8 + ((kg - lo) / Math.max(hi - lo, 0.6)) * 88 }}
              />
            )}
          </View>
        ))}
      </View>
      <Text className="font-inter text-xs text-subtle">{t('home.weeks')}</Text>
    </WeightCard>
  );
}

/** Large 4, big number: the trend, large over a faint line of it, the change over 7, 30 and 90 days. */
export function LargeNumber({ data, units }: WeightBoxProps) {
  const { t } = useTranslation('weight');
  const [width, onLayout] = useWidth();
  return (
    <WeightCard>
      <View onLayout={onLayout} className="absolute inset-x-0 top-15">
        <TrendLine
          series={data.series}
          width={width}
          height={60}
          opacity={0.3}
          endDot={false}
          strokeWidth={3}
        />
      </View>
      <View className="gap-1 px-4 pt-4">
        <Overline accent>{t('home.title')}</Overline>
        <WeightValue kg={data.latest.trendKg} units={units} size={56} />
      </View>
      <View className="mt-8 flex-row border-t border-line">
        {data.changes.map((c, i) => (
          <View
            key={c.days}
            className={cn('flex-1 gap-1 px-4 py-3', i > 0 && 'border-l border-line')}
          >
            <Text className="font-inter text-xs text-subtle">
              {t('history.days', { count: c.days })}
            </Text>
            <ChangeText kg={c.changeKg} units={units} />
          </View>
        ))}
      </View>
    </WeightCard>
  );
}

/** Large 5, calendar: the last five weeks, a neon square for each day weighed in, and logging today. */
export function LargeCalendar({ data, units }: WeightBoxProps) {
  const { t } = useTranslation('weight');
  const first = addDays(startOfWeek(fromIsoDate(data.today)), -28);
  const days = Array.from({ length: 35 }, (_, i) => toIsoDate(addDays(first, i)));
  const logged = new Set(data.points.map((p) => p.date));
  const count = days.filter((d) => logged.has(d)).length;
  const today = logged.has(data.today);
  return (
    <WeightCard className="gap-4 px-4 pt-4 pb-4">
      <View className="flex-row items-end justify-between">
        <View className="gap-1">
          <Overline>{t('home.title')}</Overline>
          <WeightValue kg={data.latest.trendKg} units={units} size={34} />
        </View>
        <Text className="font-inter text-xs text-subtle">{t('home.weighIns', { count })}</Text>
      </View>
      <View className="gap-1.5">
        {[0, 1, 2, 3, 4].map((week) => (
          <View key={week} className="flex-row gap-1.5">
            {days.slice(week * 7, week * 7 + 7).map((day) => (
              <View
                key={day}
                className={cn(
                  'h-4.5 flex-1 rounded-[5px]',
                  logged.has(day)
                    ? 'bg-accent'
                    : day > data.today
                      ? 'bg-transparent'
                      : 'bg-control',
                  day === data.today && !logged.has(day) && 'border border-fg-2',
                )}
              />
            ))}
          </View>
        ))}
      </View>
      {today ? (
        <View className="h-10 flex-row items-center justify-center gap-1.5 rounded-full bg-control">
          <Icon name="check" size={14} color={colors.accent} />
          <Text variant="caption" className="text-sm">
            {t('home.loggedToday')}
          </Text>
        </View>
      ) : (
        <PressableScale
          haptic="press"
          onPress={() => router.push('/body-weight/today')}
          className="h-10 flex-row items-center justify-center gap-1.5 rounded-full bg-accent"
        >
          <Icon name="plus" size={14} color={colors.onAccent} />
          <Text variant="caption" tone="onAccent" className="text-sm">
            {t('history.add')}
          </Text>
        </PressableScale>
      )}
    </WeightCard>
  );
}
