import type { TFunction } from 'i18next';

import { formatNumber } from '@/shared/lib/format';

// The chart under a coach answer, as the coach-chat Edge Function saves it with the answer: the
// same shapes as Chart in supabase/functions/_shared/coach/tools.ts. Weights are already in the
// user's unit there; `unit` says which.

export interface ChartPoint {
  /** YYYY-MM-DD in the user's time zone. */
  date: string;
  value: number;
}

export type ExerciseMetric = 'e1rm' | 'top_weight' | 'reps' | 'seconds' | 'volume';

export interface TrendChart {
  type: 'trend';
  metric: ExerciseMetric | 'body_weight' | 'body_score';
  unit: string;
  exerciseId: string | null;
  points: ChartPoint[];
  /** Body weight: the smoothed line through the measurements. */
  line: ChartPoint[] | null;
  records: ChartPoint[] | null;
}

export interface CompareChart {
  type: 'compare';
  metric: ExerciseMetric;
  unit: string;
  asPercent: boolean;
  series: { exerciseId: string; points: ChartPoint[] }[];
}

export type PeriodMetric = 'volume' | 'sets' | 'workouts' | 'minutes';

export interface PeriodChart {
  type: 'period_vs_average';
  metric: PeriodMetric;
  unit: string;
  period: 'week' | 'month';
  /** Oldest first; the last is the current period. */
  bars: ChartPoint[];
  average: number | null;
}

export interface CalendarDay extends ChartPoint {
  sets?: number;
}

export interface CalendarChart {
  type: 'calendar';
  from: string;
  to: string;
  days: CalendarDay[];
}

export interface DistributionChart {
  type: 'distribution';
  by: 'muscle' | 'exercise' | 'weekday';
  unit: string;
  reference: number | null;
  rows: { key: string; value: number }[];
}

export type CoachChart =
  TrendChart | CompareChart | PeriodChart | CalendarChart | DistributionChart;

/** A stored chart, or null when it isn't one the app knows (a newer server). */
export function toChart(value: unknown): CoachChart | null {
  const type = (value as { type?: unknown } | null)?.type;
  return ['trend', 'compare', 'period_vs_average', 'calendar', 'distribution'].includes(
    String(type),
  )
    ? (value as CoachChart)
    : null;
}

const NBSP = ' ';

/** Large weights (volumes) in tonnes, as the coach writes them: "9,6 t". */
const inTonnes = (value: number, unit: string) => unit === 'kg' && Math.abs(value) >= 1000;

/** A chart value with its unit: "79,6 kg", "9,6 t", "12 Wdh.", "45 s". */
export function formatValue(value: number, unit: string, t: TFunction<'coach'>) {
  if (inTonnes(value, unit)) return `${formatNumber(value / 1000, 1)}${NBSP}t`;
  if (unit === 'kg' || unit === 'lb') return `${formatNumber(value, 1)}${NBSP}${unit}`;
  if (unit === 's') return `${formatNumber(value, 0)}${NBSP}s`;
  if (unit === 'min') return `${formatNumber(value, 0)}${NBSP}min`;
  if (unit === 'reps') return t('values.reps', { count: value });
  if (unit === 'points') return t('values.points', { count: value });
  if (unit === 'sets') return t('values.sets', { count: value });
  if (unit === 'workouts') return t('values.workouts', { count: value });
  return formatNumber(value, 1);
}

/** The number alone, for axes: "84", "9,6". */
export const formatAxisValue = (value: number, unit: string) =>
  inTonnes(value, unit) ? formatNumber(value / 1000, 1) : formatNumber(value, 1);

/** A signed change: "+4,6 kg", "−4,6 kg", "+23 %". */
export function formatChange(change: number, unit: string, t: TFunction<'coach'>) {
  const sign = change > 0 ? '+' : change < 0 ? '−' : '±';
  return `${sign}${unit === '%' ? `${formatNumber(Math.abs(change), 0)}${NBSP}%` : formatValue(Math.abs(change), unit, t)}`;
}

/** Steps of 1, 2 or 5 × 10ⁿ: at least `count` labels between `min` and `max`. */
export function niceTicks(min: number, max: number, count = 3) {
  const span = max - min || Math.abs(max) || 1;
  const raw = span / (count - 1);
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = [5, 2, 1].map((m) => m * power).find((s) => s <= raw) ?? power;
  const ticks: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) ticks.push(v);
  return ticks;
}

/** The chart a chat is about, for the header under "Coach" ("Körpergewicht", "Vergleich"). */
export function chartTopic(chart: CoachChart, t: TFunction<'coach'>, exerciseName: string | null) {
  switch (chart.type) {
    case 'trend':
      if (chart.metric === 'body_weight') return t('topics.bodyWeight');
      if (chart.metric === 'body_score') return t('topics.bodyScore');
      return exerciseName ?? t('topics.progress');
    case 'compare':
      return t('topics.compare');
    case 'period_vs_average':
      return t(`topics.${chart.metric}`);
    case 'calendar':
      return t('topics.consistency');
    case 'distribution':
      return t(`topics.by.${chart.by}`);
  }
}
