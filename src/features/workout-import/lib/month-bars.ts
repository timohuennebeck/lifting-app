import { getOrInsert } from '@/shared/lib/map';

import { type LoggedWorkout, spreadUndated } from './history';

/** A month of the history: workouts with a date of their own, and those given one. */
export interface MonthBar {
  month: Date;
  dated: number;
  spread: number;
}

const monthIndex = (date: Date) => date.getFullYear() * 12 + date.getMonth();

/**
 * 18a: `count` months in a row of the history, with the workouts spreadUndated gives a date. The
 * months with the most of those (the latest of equal ones), ending with the last if fewer.
 */
export function monthBars(workouts: LoggedWorkout[], count = 6): MonthBar[] {
  const byMonth = new Map<number, MonthBar>();
  for (const w of spreadUndated(workouts)) {
    if (!w.start) continue;
    const { start } = w;
    const bar = getOrInsert(byMonth, monthIndex(start), () => ({
      month: new Date(start.getFullYear(), start.getMonth(), 1),
      dated: 0,
      spread: 0,
    }));
    if (w.estimated) bar.spread += 1;
    else bar.dated += 1;
  }
  if (!byMonth.size) return [];
  const months = [...byMonth.keys()];
  const first = Math.min(...months);
  const last = Math.max(...months);
  const spreadFrom = (from: number) =>
    Array.from({ length: count }, (_, k) => byMonth.get(from + k)?.spread ?? 0).reduce(
      (a, b) => a + b,
      0,
    );
  let from = Math.max(first, last - count + 1);
  for (let start = from - 1; start >= first; start--) {
    if (spreadFrom(start) > spreadFrom(from)) from = start;
  }
  return Array.from(
    { length: Math.min(count, last - from + 1) },
    (_, k) =>
      byMonth.get(from + k) ?? {
        month: new Date(Math.floor((from + k) / 12), (from + k) % 12, 1),
        dated: 0,
        spread: 0,
      },
  );
}
