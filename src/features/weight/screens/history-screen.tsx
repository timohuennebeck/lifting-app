import { router } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUnits } from '@/shared/data/profile';
import { deleteWeightEntry, useWeightEntries } from '@/shared/data/weight-entries';
import { useToday } from '@/shared/hooks/use-today';
import { toIsoDate } from '@/shared/lib/date';
import { weightUnit } from '@/shared/lib/format';
import { IconButton } from '@/shared/ui/icon-button';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';

import { EntryRow } from '../components/entry-row';
import { TrendChangeRow } from '../components/trend-change-row';
import { OVERLINE, WeightOverview } from '../components/weight-overview';
import { useDayLabel } from '../hooks/use-day-label';
import { trendChange, withTrend } from '../lib/trend';

/** Spans of the "Veränderung · Trend" rows, in days. */
const CHANGE_DAYS = [3, 7, 14, 30, 90];

/** A day's entry to edit; `add`: a new entry, starting on that day (the "+"). */
const openEntry = (date: string, add = false) =>
  router.push({ pathname: '/body-weight/[date]', params: add ? { date, add: '1' } : { date } });

/**
 * Weight history (GW·2): the trend and its change over the chosen range, the chart, how the
 * trend moved over the last days, and every weigh-in. The "+" leads to the entry.
 */
export function WeightHistoryScreen() {
  const { t } = useTranslation('weight');
  const insets = useSafeAreaInsets();
  const units = useUnits();
  const dayLabel = useDayLabel();
  const { entries, isLoading } = useWeightEntries();
  const points = useMemo(() => withTrend(entries), [entries]);
  const today = toIsoDate(new Date(useToday()));
  const changes = useMemo(
    () => CHANGE_DAYS.flatMap((days) => trendChange(points, today, days) ?? []),
    [points, today],
  );
  const newestFirst = useMemo(() => [...points].reverse(), [points]);

  const header = (
    <View>
      <WeightOverview points={points} today={today} units={units} />

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
        // Labels over the rows' columns (see EntryRow): the weight, and the trend in its colour.
        <View className="mt-5.5 mb-1.25 flex-row px-5">
          <Text variant="overline" tone="subtle" className={`flex-1 ${OVERLINE}`}>
            {t('history.entries')}
          </Text>
          <Text variant="overline" tone="subtle" className={`w-18 text-right ${OVERLINE}`}>
            {weightUnit(units)}
          </Text>
          <Text variant="overline" tone="accent" className={`w-18 text-right ${OVERLINE}`}>
            {t('history.trend')}
          </Text>
          <View className="w-13.5" />
        </View>
      ) : null}
    </View>
  );

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <ScreenHeader
        title={t('history.title')}
        action={
          <IconButton
            icon="plus"
            accessibilityLabel={t('history.add')}
            onPress={() => openEntry(today, true)}
          />
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
