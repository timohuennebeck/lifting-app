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

import { CalendarMonth, monthHeight } from '../components/calendar-month';
import { returnPickedDate } from '../lib/pick-date';

interface Month {
  year: number;
  month: number;
}

/** Months on each side of this one at first, and added whenever about three are left. */
const FIRST_MONTHS = 6;
const MORE_MONTHS = 3;
/** How far the list grows: a safety stop should adding months on top ever run away. */
const MAX_PAST = 120;
const MAX_FUTURE = 60;

/** Months from the first weigh-in's month up to this one, not counting this one. */
function monthsSince(today: string, first: string | undefined) {
  const [year, month] = today.split('-').map(Number);
  const [firstYear, firstMonth] = (first ?? today).split('-').map(Number);
  return (year - firstYear) * 12 + month - firstMonth;
}

/** The month `offset` months away from (year, month). */
function shiftMonth(year: number, month: number, offset: number): Month {
  const index = year * 12 + month - 1 + offset;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

/**
 * Weight calendar (GW·3B), oldest month on top as in Apple's Calendar. It opens on this month
 * and loads further months both ways while scrolling. A day opens its entry, or, when the entry
 * screen's date chip opened the calendar (`pick`), goes back there with that day.
 */
export function WeightCalendarScreen() {
  const { pick } = useLocalSearchParams<{ pick?: string }>();
  const { t } = useTranslation(['weight', 'common']);
  const insets = useSafeAreaInsets();
  const units = useUnits();
  const { entries, isLoading } = useWeightEntries();
  const today = toIsoDate(new Date(useNow(MINUTE_MS)));
  const weekdays = t('common:weekdays.short', { returnObjects: true }) as string[];
  const weights = useMemo(() => new Map(entries.map((e) => [e.date, e.weightKg])), [entries]);

  // Back to the first weigh-in at least, so its month is there without loading more.
  const [past, setPast] = useState(FIRST_MONTHS);
  const [future, setFuture] = useState(FIRST_MONTHS);
  const before = Math.max(past, monthsSince(today, entries[0]?.date));
  const [year, month] = today.split('-').map(Number);
  const months = Array.from({ length: before + 1 + future }, (_, i) =>
    shiftMonth(year, month, i - before),
  );
  // Fixed heights (see monthHeight) let the list start on this month without measuring.
  const heights = months.map((m) => monthHeight(m.year, m.month));
  let total = 0;
  const offsets = heights.map((height) => (total += height) - height);

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
      {/* The same columns as the days (CalendarMonth's px-3), so each letter sits over its day. */}
      <View className="mt-3.25 flex-row px-3 pb-1.75">
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
      {/* Waits for the entries, so it opens on this month even when they reach far back. */}
      {isLoading ? null : (
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
          getItemLayout={(_, index) => ({ length: heights[index], offset: offsets[index], index })}
          initialScrollIndex={before}
          // Months added on top keep what's on screen in place.
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
          // About three months (~1,100pt) before either end.
          onStartReached={() => setPast(Math.min(before + MORE_MONTHS, MAX_PAST))}
          onStartReachedThreshold={1.5}
          onEndReached={() => setFuture(Math.min(future + MORE_MONTHS, MAX_FUTURE))}
          onEndReachedThreshold={1.5}
          // Only what's on screen first, so the page opens without waiting for other months.
          initialNumToRender={3}
          maxToRenderPerBatch={2}
          windowSize={5}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        />
      )}
    </View>
  );
}
