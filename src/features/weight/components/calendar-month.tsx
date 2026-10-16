import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View } from 'react-native';

import { daysInMonth, isoDate, mondayIndex } from '@/shared/lib/date';
import { formatDate, type UnitSystem } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';
import { haptics } from '@/shared/lib/haptics';
import { Text } from '@/shared/ui/text';

import { formatBodyWeight } from '../lib/format';

export interface CalendarMonthProps {
  year: number;
  /** 1–12. */
  month: number;
  /** kg per ISO date, for the days of this month that have an entry. */
  weights: ReadonlyMap<string, number>;
  /** Today's ISO date: outlined in grey, and the days after it can't be picked. */
  today: string;
  units: UnitSystem;
  onPick: (date: string) => void;
}

/** The title block with its padding, and one 60pt row per calendar week (`h-15` cells). */
const MONTH_CHROME = 60;
const WEEK_ROW = 60;

/** A month's height, fixed so the calendar can open on a month without measuring those above. */
export function monthHeight(year: number, month: number) {
  const weeks = Math.ceil(
    (mondayIndex(new Date(year, month - 1, 1)) + daysInMonth(year, month)) / 7,
  );
  return MONTH_CHROME + WEEK_ROW * weeks;
}

/** A month of the weight calendar: a ring and the weight on days with an entry (GW·3B). */
export const CalendarMonth = memo(function CalendarMonth({
  year,
  month,
  weights,
  today,
  units,
  onPick,
}: CalendarMonthProps) {
  const { t } = useTranslation('weight');
  const days = daysInMonth(year, month);
  const lead = mondayIndex(new Date(year, month - 1, 1));
  const cells = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: days }, (_, i) => isoDate(year, month, i + 1)),
  ];
  const rows = Array.from({ length: Math.ceil(cells.length / 7) }, (_, r) =>
    cells.slice(r * 7, r * 7 + 7),
  );
  const count = cells.filter((d) => d && weights.has(d)).length;

  return (
    <View className="pt-4.75 pb-1" style={{ height: monthHeight(year, month) }}>
      <View className="flex-row items-baseline justify-between px-5">
        <Text className="font-inter-semibold text-xl leading-6.5">
          {formatDate(new Date(year, month - 1, 1), { month: 'long', year: 'numeric' })}
        </Text>
        {count ? (
          <Text tone="subtle" className="font-inter-medium text-[13px]">
            {t('calendar.entries', { count })}
          </Text>
        ) : null}
      </View>
      <View className="mt-2.75 px-3">
        {rows.map((row, r) => (
          <View key={r} className="flex-row">
            {Array.from({ length: 7 }, (_, c) => {
              const date = row[c];
              if (!date) return <View key={c} className="h-15 flex-1" />;
              const kg = weights.get(date);
              const future = date > today;
              return (
                // A plain touchable: a month has up to 31 of these, and an animated one each was
                // what made the calendar slow to open.
                <TouchableOpacity
                  key={c}
                  activeOpacity={0.6}
                  disabled={future}
                  accessibilityRole="button"
                  accessibilityLabel={formatDate(new Date(`${date}T12:00`), {
                    day: 'numeric',
                    month: 'long',
                  })}
                  onPress={() => {
                    haptics.tap();
                    onPick(date);
                  }}
                  className="h-15 flex-1 items-center"
                >
                  <View
                    // Today stays grey with an entry too, so it's easy to find.
                    className={cn(
                      'size-10 items-center justify-center rounded-full',
                      date === today
                        ? 'border-2 border-fg/35'
                        : kg !== undefined && 'border-2 border-accent',
                    )}
                  >
                    <Text variant="label" className={cn('tabular-nums', future && 'text-fg/25')}>
                      {Number(date.slice(8))}
                    </Text>
                  </View>
                  {kg !== undefined ? (
                    <Text
                      tone="muted"
                      className="mt-1 font-inter-medium text-[10px] leading-3.25 tabular-nums"
                    >
                      {formatBodyWeight(kg, units)}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
});
