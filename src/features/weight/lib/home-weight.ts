import { daysBetween } from '@/shared/lib/date';

import { daysBefore, trendChange, trendOn, type WeightPoint } from './trend';

/** Days the home boxes reach back at most. */
export const HOME_DAYS = 90;

export interface HomeWeight {
  points: WeightPoint[];
  latest: WeightPoint;
  today: string;
  /** The trend on each day up to today, oldest first: the last 90, or since the first weigh-in. */
  series: number[];
  /** How the trend moved over 7, 30 and 90 days; null where the weigh-ins don't reach back. */
  changes: { days: number; changeKg: number | null }[];
}

/** What the home screen's weight boxes show, or null before the first weigh-in. */
export function homeWeight(points: WeightPoint[], today: string): HomeWeight | null {
  const latest = points.at(-1);
  if (!latest) return null;
  const span = Math.min(HOME_DAYS, Math.max(1, daysBetween(points[0].date, today)));
  const series = Array.from(
    { length: span + 1 },
    (_, i) => trendOn(points, daysBefore(today, span - i)) ?? points[0].trendKg,
  );
  const changes = [7, 30, 90].map((days) => ({
    days,
    changeKg: trendChange(points, today, days)?.changeKg ?? null,
  }));
  return { points, latest, today, series, changes };
}

/** The last `days` + 1 values of the daily trend (fewer while the history is shorter). */
export const lastDays = (series: number[], days: number) => series.slice(-(days + 1));

/** The weigh-ins of the last `days` days as dots on `lastDays(series, days)`. */
export function weighInDots({ points, series, today }: HomeWeight, days: number) {
  const shown = Math.min(days, series.length - 1);
  const from = daysBefore(today, shown);
  return points
    .filter((p) => p.date >= from && p.date <= today)
    .map((p) => ({ index: daysBetween(from, p.date), kg: p.weightKg }));
}

/** The trend's change over `days`, or null while the history is shorter. */
export const changeOver = (data: HomeWeight, days: number) =>
  data.changes.find((c) => c.days === days)?.changeKg ?? null;
