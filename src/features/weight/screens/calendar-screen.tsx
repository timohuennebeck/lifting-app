import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';
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

interface Month {
  year: number;
  month: number;
}

/** Months from this one back to the first weigh-in's, newest first. */
function monthsBack(today: string, first: string | undefined): Month[] {
  const [year, month] = today.split('-').map(Number);
  const [firstYear, firstMonth] = (first ?? today).split('-').map(Number);
  const count = Math.max(1, (year - firstYear) * 12 + month - firstMonth + 1);
  return Array.from({ length: count }, (_, i) => {
    const index = year * 12 + month - 1 - i;
    return { year: Math.floor(index / 12), month: (index % 12) + 1 };
  });
}

/** Weight calendar (GW·3B): every month with the days' weights; a day opens its entry. */
export function WeightCalendarScreen() {
  const { t } = useTranslation(['weight', 'common']);
  const insets = useSafeAreaInsets();
  const units = useUnits();
  const { entries } = useWeightEntries();
  const today = toIsoDate(new Date(useNow(MINUTE_MS)));
  const weekdays = t('common:weekdays.short', { returnObjects: true }) as string[];
  const weights = useMemo(() => new Map(entries.map((e) => [e.date, e.weightKg])), [entries]);
  const months = useMemo(() => monthsBack(today, entries[0]?.date), [today, entries]);
  const pick = useCallback(
    (date: string) => router.push({ pathname: '/body-weight/[date]', params: { date } }),
    [],
  );

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <ScreenHeader title={t('calendar.title')} />
      <View className="mt-3.25 flex-row border-b border-chip px-3.5 pb-1.75">
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
            onPick={pick}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      />
    </View>
  );
}
