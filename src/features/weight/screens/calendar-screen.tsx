import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUnits } from '@/shared/data/profile';
import { useWeightEntries } from '@/shared/data/weight-entries';
import { useNow } from '@/shared/hooks/use-now';
import { MINUTE_MS, toIsoDate } from '@/shared/lib/date';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';

import { CalendarMonth } from '../components/calendar-month';
import { returnPickedDate } from '../lib/pick-date';

interface Month {
  year: number;
  month: number;
}

/** Months shown at first, and added each time the list nears its end. */
const MONTH_BATCH = 12;

/** Months from this one back to the first weigh-in's month, counting both. */
function monthsSince(today: string, first: string | undefined) {
  const [year, month] = today.split('-').map(Number);
  const [firstYear, firstMonth] = (first ?? today).split('-').map(Number);
  return (year - firstYear) * 12 + month - firstMonth + 1;
}

/** `count` months from this one back, newest first. */
function monthsBack(today: string, count: number): Month[] {
  const [year, month] = today.split('-').map(Number);
  return Array.from({ length: count }, (_, i) => {
    const index = year * 12 + month - 1 - i;
    return { year: Math.floor(index / 12), month: (index % 12) + 1 };
  });
}

/**
 * Weight calendar (GW·3B): the months back from this one, more as you scroll, with the days'
 * weights. A day opens its entry, or, when the entry screen's date chip opened the calendar
 * (`pick`), goes back there with that day.
 */
export function WeightCalendarScreen() {
  const { pick } = useLocalSearchParams<{ pick?: string }>();
  const { t } = useTranslation(['weight', 'common']);
  const insets = useSafeAreaInsets();
  const units = useUnits();
  const { entries } = useWeightEntries();
  const today = toIsoDate(new Date(useNow(MINUTE_MS)));
  const weekdays = t('common:weekdays.short', { returnObjects: true }) as string[];
  const weights = useMemo(() => new Map(entries.map((e) => [e.date, e.weightKg])), [entries]);
  // Endless into the past, so older weights can be added too; never into the future.
  const [shown, setShown] = useState(MONTH_BATCH);
  const count = Math.max(shown, monthsSince(today, entries[0]?.date));
  const months = monthsBack(today, count);
  const onPick = useCallback(
    (date: string) =>
      pick
        ? returnPickedDate(date)
        : router.push({ pathname: '/body-weight/[date]', params: { date } }),
    [pick],
  );

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <ScreenHeader title={t('calendar.title')} />
      <View className="mt-3.25 flex-row px-3.5 pb-1.75">
        {weekdays.map((day) => (
          <Text
            key={day}
            tone="subtle"
            className="flex-1 text-center font-inter-medium text-xs leading-4.25"
          >
            {day}
          </Text>
        ))}
      </View>
      <FlatList
        data={months}
        keyExtractor={(m) => `${m.year}-${m.month}`}
        renderItem={({ item }) => (
          <CalendarMonth
            year={item.year}
            month={item.month}
            weights={weights}
            today={today}
            units={units}
            onPick={onPick}
          />
        )}
        onEndReached={() => setShown(count + MONTH_BATCH)}
        onEndReachedThreshold={1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      />
    </View>
  );
}
