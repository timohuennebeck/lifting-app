import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';

import { addDays, DAY_MS, fromIsoDate, startOfWeek, toIsoDate } from '@/shared/lib/date';
import { colors } from '@/shared/lib/theme';
import { Text } from '@/shared/ui/text';

import { type CalendarChart as CalendarChartData, dateLabel, formatValue } from '../../lib/charts';
import { holdGesture, monthLabel, useWidth } from './chart-parts';

/** Column of weekday labels and the gap after it. */
const LABELS = 23;
/** At most this many month names under the days. */
const MONTHS = 6;

/** The day's grey mixed with the neon by `t` (0–1): one colour, so a day is one view. */
const shade = (t: number) =>
  `#${[1, 3, 5]
    .map((i) => {
      const from = parseInt(colors.chip.slice(i, i + 2), 16);
      const to = parseInt(colors.accent.slice(i, i + 2), 16);
      return Math.round(from + (to - from) * t)
        .toString(16)
        .padStart(2, '0');
    })
    .join('')}`;
const LOW = shade(0.3);
const MID = shade(0.62);

/** A trained day's colour by its share of the most sets on one day; low ones mix with the grey. */
const dayColor = (share: number) => (share >= 0.75 ? colors.accent : share >= 0.45 ? MID : LOW);

/** "Mo", "Mi": weekday names short enough for the 15pt rows. */
const weekdayLabel = (date: Date) => dateLabel(date, { weekday: 'short' }).slice(0, 2);

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

/**
 * The days the user trained (design CO3·4 "Kalender"): a column per week, a row per weekday,
 * brighter the more sets that day had. A finger held on a day reads it.
 */
export function CalendarChart({ chart }: { chart: CalendarChartData }) {
  const { t } = useTranslation('coach');
  const [width, onLayout] = useWidth();
  const [picked, setPicked] = useState<number | null>(null);
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

  // The day under a finger, as its index through the weeks; none outside the chart's days.
  const dayAt = (x: number, y: number) => {
    const week = Math.round((x - LABELS - cell / 2) / stepX);
    const weekday = Math.round((y - cell / 2) / stepY);
    const index = Math.max(0, Math.min(weeks - 1, week)) * 7 + Math.max(0, Math.min(6, weekday));
    const day = addDays(first, index);
    return day < from || day > end ? null : index;
  };
  const held = picked === null ? null : addDays(first, picked);
  const heldDay = held ? days.get(toIsoDate(held)) : undefined;
  let heldText = t('calendar.rest');
  if (heldDay) {
    heldText = heldDay.sets
      ? formatValue(heldDay.sets, 'sets', t)
      : formatValue(heldDay.value, 'workouts', t);
  }

  return (
    <View className="gap-3.5" onLayout={onLayout}>
      {width > 0 ? (
        <>
          <GestureDetector gesture={holdGesture(dayAt, picked, setPicked)}>
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
                  if (day < from || day > end) return null;
                  const key = toIsoDate(day);
                  const trained = days.get(key);
                  return (
                    <View
                      key={key}
                      className="absolute"
                      style={{
                        left: LABELS + w * stepX,
                        top: d * stepY,
                        width: cell,
                        height: cell,
                        borderRadius: Math.min(4, cell / 3),
                        backgroundColor: trained
                          ? dayColor((trained.sets ?? trained.value) / most)
                          : colors.chip,
                      }}
                    />
                  );
                }),
              )}
              {picked !== null ? (
                <View
                  className="absolute border-2 border-fg"
                  style={{
                    left: LABELS + Math.floor(picked / 7) * stepX,
                    top: (picked % 7) * stepY,
                    width: cell,
                    height: cell,
                    borderRadius: Math.min(4, cell / 3),
                  }}
                />
              ) : null}
            </View>
          </GestureDetector>
          {held ? (
            <Text className="font-inter-semibold text-[11px] leading-[14px] text-fg">
              {`${dateLabel(held, { weekday: 'short', day: 'numeric', month: 'short' })} · ${heldText}`}
            </Text>
          ) : (
            <View className="flex-row justify-between">
              {months.map((label, i) => (
                <Text key={i} className="font-inter-semibold text-[11px] leading-[14px] text-dim">
                  {label}
                </Text>
              ))}
            </View>
          )}
        </>
      ) : null}
    </View>
  );
}
