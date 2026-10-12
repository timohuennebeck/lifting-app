import type { WeightEntry } from '@/shared/data/weight-entries';
import { addDays, daysBetween, fromIsoDate, toIsoDate } from '@/shared/lib/date';

/**
 * How far each weigh-in moves the trend toward the scale value; a gap of n days counts n times.
 * The body check analysis (analyze-body-check) computes the same trend.
 */
const SMOOTHING = 0.1;

/** Within this many kg of the trend a weigh-in counts as on the trend. */
const ON_TREND_KG = 0.05;

export interface WeightPoint extends WeightEntry {
  /** The smoothed weight after this weigh-in. */
  trendKg: number;
  /** Change since the weigh-in before; null for the first. */
  changeKg: number | null;
}

/** Entries (oldest first) with their trend. */
export function withTrend(entries: WeightEntry[]): WeightPoint[] {
  const points: WeightPoint[] = [];
  for (const entry of entries) {
    const prev = points.at(-1);
    const days = prev ? Math.max(1, daysBetween(prev.date, entry.date)) : 0;
    const trendKg = prev
      ? prev.trendKg + (1 - (1 - SMOOTHING) ** days) * (entry.weightKg - prev.trendKg)
      : entry.weightKg;
    points.push({ ...entry, trendKg, changeKg: prev ? entry.weightKg - prev.weightKg : null });
  }
  return points;
}

/** The trend on a day: that of the last weigh-in on or before it; undefined before the first. */
export function trendOn(points: WeightPoint[], date: string) {
  let trend: number | undefined;
  for (const p of points) {
    if (p.date > date) break;
    trend = p.trendKg;
  }
  return trend;
}

/** Where a weigh-in sits against its trend: below (< 0), on it (0) or above (> 0), in kg. */
export const offTrend = (p: WeightPoint) =>
  Math.abs(p.weightKg - p.trendKg) < ON_TREND_KG ? 0 : p.weightKg - p.trendKg;

/** The ISO date `days` before `today`. */
export const daysBefore = (today: string, days: number) =>
  toIsoDate(addDays(fromIsoDate(today), -days));

export interface TrendChange {
  days: number;
  changeKg: number;
  /** One trend value per day, oldest first, for the sparkline. */
  series: number[];
}

/**
 * How the trend moved over the last `days` days up to `today`, or null while the weigh-ins
 * don't reach back that far.
 */
export function trendChange(
  points: WeightPoint[],
  today: string,
  days: number,
): TrendChange | null {
  const start = trendOn(points, daysBefore(today, days));
  const end = trendOn(points, today);
  if (start === undefined || end === undefined) return null;
  const series = Array.from(
    { length: days + 1 },
    (_, i) => trendOn(points, daysBefore(today, days - i)) ?? start,
  );
  return { days, changeKg: end - start, series };
}
