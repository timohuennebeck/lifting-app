import { View } from 'react-native';

import { addDays, DAY_MS, fromIsoDate, startOfWeek } from '@/shared/lib/date';
import { formatDate } from '@/shared/lib/format';
import { Text } from '@/shared/ui/text';

import { type CalendarChart as CalendarChartData } from '../../lib/charts';
import { monthLabel, useWidth } from './chart-parts';

/** Column of weekday labels and the gap after it. */
const LABELS = 23;
/** At most this many month names under the days. */
const MONTHS = 6;

/** A trained day's neon by its share of the most sets on one day; low ones mix with the grey. */
const strength = (share: number) => (share >= 0.75 ? 1 : share >= 0.45 ? 0.62 : 0.3);

/** "Mo", "Mi": weekday names short enough for the 15pt rows. */
const weekdayLabel = (date: Date) =>
  formatDate(date, { weekday: 'short' }).replace('.', '').slice(0, 2);

/** Month names from `from`'s month to `to`'s, every other (or third) one when there are many. */
function monthLabels(from: Date, to: Date) {
  const months: string[] = [];
  for (
    let month = new Date(from.getFullYear(), from.getMonth(), 1);
    month <= to;
    month = new Date(month.getFullYear(), month.getMonth() + 1, 1)
  ) {
    months.push(monthLabel(month));
  }
  const every = Math.ceil(months.length / MONTHS);
  return months.filter((_, i) => i % every === 0);
}

const isoDay = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/**
 * The days the user trained (design CO3·4 "Kalender"): a column per week, a row per weekday,
 * brighter the more sets that day had.
 */
export function CalendarChart({ chart }: { chart: CalendarChartData }) {
  const [width, onLayout] = useWidth();
  const days = new Map(chart.days.map((d) => [d.date, d]));
  const most = Math.max(1, ...chart.days.map((d) => d.sets ?? d.value));
  const from = fromIsoDate(chart.from);
  const end = fromIsoDate(chart.to);
  const start = startOfWeek(from);
  const lastMonday = startOfWeek(end);
  const allWeeks = Math.round((lastMonday.getTime() - start.getTime()) / (7 * DAY_MS)) + 1;
  // 15pt days 4pt apart, smaller when many weeks must fit; at most the last ones that do.
  const room = Math.max(0, width - LABELS) + 4;
  const stepX = Math.max(6, Math.min(19, room / allWeeks));
  const weeks = Math.min(allWeeks, Math.floor(room / stepX));
  const first = addDays(start, (allWeeks - weeks) * 7);
  const cell = stepX >= 12 ? stepX - 4 : stepX - 2;
  const stepY = cell + (stepX >= 12 ? 4 : 2);

  const columns = Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => addDays(first, w * 7 + d)),
  );
  // The months shown, spread under the days.
  const months = monthLabels(new Date(Math.max(first.getTime(), from.getTime())), end);

  return (
    <View className="gap-3.5" onLayout={onLayout}>
      {width > 0 ? (
        <>
          <View style={{ height: 7 * stepY - (stepY - cell) }}>
            {columns[0]?.map((day, d) =>
              d % 2 === 0 ? (
                <Text
                  key={d}
                  className="absolute left-0 font-inter-semibold text-[10px] leading-[15px] text-dim"
                  style={{ top: d * stepY + (cell - 15) / 2 }}
                >
                  {weekdayLabel(day)}
                </Text>
              ) : null,
            )}
            {columns.map((week, w) =>
              week.map((day, d) => {
                const key = isoDay(day);
                if (day < from || day > end) return null;
                const trained = days.get(key);
                const share = trained ? (trained.sets ?? trained.value) / most : 0;
                return (
                  <View
                    key={key}
                    className="absolute overflow-hidden bg-chip"
                    style={{
                      left: LABELS + w * stepX,
                      top: d * stepY,
                      width: cell,
                      height: cell,
                      borderRadius: Math.min(4, cell / 3),
                    }}
                  >
                    {trained ? (
                      <View className="flex-1 bg-accent" style={{ opacity: strength(share) }} />
                    ) : null}
                  </View>
                );
              }),
            )}
          </View>
          <View className="flex-row justify-between">
            {months.map((label, i) => (
              <Text key={i} className="font-inter-semibold text-[11px] leading-[14px] text-dim">
                {label}
              </Text>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}
