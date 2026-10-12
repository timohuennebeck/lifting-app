import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUnits } from '@/shared/data/profile';
import { deleteWeightEntry, useWeightEntries } from '@/shared/data/weight-entries';
import { useNow } from '@/shared/hooks/use-now';
import { MINUTE_MS, toIsoDate } from '@/shared/lib/date';
import { formatShortDate } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { IconButton } from '@/shared/ui/icon-button';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';

import { EntryRow, useDayLabel } from '../components/entry-row';
import { type ChartRange, RangeTabs } from '../components/range-tabs';
import { TrendChangeRow } from '../components/trend-change-row';
import { WeightChart } from '../components/weight-chart';
import { formatChange, formatKg } from '../lib/format';
import { daysBefore, trendChange, trendOn, withTrend } from '../lib/trend';

/** Section and value labels: 12pt caps, set 1pt lower than their line box like the design's. */
const OVERLINE = 'relative top-px text-xs leading-4 tracking-[1.65px]';

/** Spans of the "Veränderung · Trend" rows, in days. */
const CHANGE_DAYS = [3, 7, 14, 30, 90];

const openEntry = (date: string) =>
  router.push({ pathname: '/body-weight/[date]', params: { date } });

/**
 * Weight history (GW·2): the trend and its change over the chosen range, the chart, how the
 * trend moved over the last days, and every weigh-in. Calendar and "+" lead to the entry.
 */
export function WeightHistoryScreen() {
  const { t } = useTranslation(['weight', 'common']);
  const insets = useSafeAreaInsets();
  const units = useUnits();
  const unit = t(`common:units.${units === 'imperial' ? 'lb' : 'kg'}`);
  const dayLabel = useDayLabel();
  const { entries, isLoading } = useWeightEntries();
  const points = useMemo(() => withTrend(entries), [entries]);
  // Ticks every minute so "today" turns over at midnight.
  const today = toIsoDate(new Date(useNow(MINUTE_MS)));
  const [range, setRange] = useState<ChartRange>(30);
  const [selected, setSelected] = useState<number | null>(null);

  const from = daysBefore(today, range - 1);
  const visible = useMemo(
    () => points.filter((p) => p.date >= from && p.date <= today),
    [points, from, today],
  );
  // A picked weigh-in that was deleted falls back to the latest.
  const shown = (selected === null ? undefined : visible[selected]) ?? visible.at(-1);
  const startTrend = trendOn(points, from) ?? visible[0]?.trendKg;
  const changes = useMemo(
    () => CHANGE_DAYS.flatMap((days) => trendChange(points, today, days) ?? []),
    [points, today],
  );
  const newestFirst = useMemo(() => [...points].reverse(), [points]);

  const changeRange = (next: ChartRange) => {
    setRange(next);
    setSelected(null);
  };

  const header = (
    <View>
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
              {shown ? formatKg(shown.trendKg, units) : '–'}
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
          onSelect={setSelected}
        />
      </View>
      <RangeTabs value={range} onChange={changeRange} className="mx-4 mt-5" />

      {changes.length ? (
        <>
          <Text variant="overline" tone="subtle" className={`mt-8.75 mb-1.5 px-5 ${OVERLINE}`}>
            {t('history.changes')}
          </Text>
          {changes.map((change) => (
            <TrendChangeRow key={change.days} change={change} units={units} />
          ))}
        </>
      ) : null}
      {points.length ? (
        <Text variant="overline" tone="subtle" className={`mt-5.5 mb-1.25 px-5 ${OVERLINE}`}>
          {t('history.entries')}
        </Text>
      ) : null}
    </View>
  );

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <ScreenHeader
        title={t('history.title')}
        leading={
          // As wide as the two buttons on the right, so the title stays centred.
          <View className="flex-row gap-2">
            <IconButton
              icon="chevron-left"
              accessibilityLabel={t('common:actions.back')}
              onPress={() => router.back()}
            />
            <View className="size-10.5" />
          </View>
        }
        action={
          <View className="flex-row gap-2">
            <IconButton
              icon="calendar"
              iconSize={16}
              accessibilityLabel={t('history.calendar')}
              onPress={() => router.push('/body-weight/calendar')}
            />
            <IconButton
              icon="plus"
              accessibilityLabel={t('history.add')}
              color={colors.onAccent}
              className="bg-accent"
              onPress={() => openEntry(today)}
            />
          </View>
        }
      />
      <FlatList
        data={newestFirst}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <EntryRow
            point={item}
            units={units}
            dayLabel={dayLabel}
            onPress={() => openEntry(item.date)}
            onDelete={() => void deleteWeightEntry(item.id)}
          />
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={
          isLoading ? null : (
            <Text variant="paragraph" tone="subtle" className="mt-8 px-5 text-center">
              {t('history.empty')}
            </Text>
          )
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      />
    </View>
  );
}
