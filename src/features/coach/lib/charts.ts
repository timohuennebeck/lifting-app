import type { TFunction } from 'i18next';

import { formatDate, formatNumber, NBSP, signOf } from '@/shared/lib/format';

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

/** A training day: its number of workouts (`value`) and of sets. */
export interface CalendarDay extends ChartPoint {
  sets: number;
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
  reference: number | null;
  rows: { key: string; value: number }[];
}

/**
 * Not a chart but in its place: a workout on a card, one Kai built, which the card saves once it is
 * opened, or one the user saved (`routineId`).
 */
export interface WorkoutChart {
  type: 'workout';
  name: string;
  routineId?: string;
  exercises: {
    exerciseId: string;
    sets: number;
    /** Reps of every set, or seconds for a timed exercise; null without a target. */
    targetMin: number | null;
    targetMax: number | null;
    rir: number | null;
    /** null: the exercise's own rest. */
    restSeconds: number | null;
  }[];
}

/**
 * Not a chart but in its place: a change to the user's plan on a card. Per exercise, the options
 * the user picks from before applying it in the plan's workouts that have it.
 */
export interface SwapChart {
  type: 'swap';
  swaps: {
    exerciseId: string;
    /** The plan's workouts it is swapped in, in plan order. */
    routineIds: string[];
    /** 1 to 3 exercises that log the same (reps or seconds), best first. */
    options: string[];
  }[];
}

export type CoachChart =
  | TrendChart
  | CompareChart
  | PeriodChart
  | CalendarChart
  | DistributionChart
  | WorkoutChart
  | SwapChart;

/** Shown on a card of the page's whole width instead of beside the answer. */
export type CardChart = WorkoutChart | SwapChart;

const CHART_TYPES = [
  'trend',
  'compare',
  'period_vs_average',
  'calendar',
  'distribution',
  'workout',
  'swap',
];

/** A stored chart, or null when it isn't one the app knows (a newer server). */
export function toChart(value: unknown): CoachChart | null {
  const type = (value as { type?: unknown } | null)?.type;
  return CHART_TYPES.includes(String(type)) ? (value as CoachChart) : null;
}

export const isCardChart = (chart: CoachChart | null): chart is CardChart =>
  chart?.type === 'workout' || chart?.type === 'swap';

/** A date part as the design writes it, without the abbreviation dot: "Mai", "Do", "28. Okt". */
export const dateLabel = (date: Date, options: Intl.DateTimeFormatOptions) =>
  formatDate(date, options).replace(/\.$/, '');

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
  return `${signOf(change)}${unit === '%' ? `${formatNumber(Math.abs(change), 0)}${NBSP}%` : formatValue(Math.abs(change), unit, t)}`;
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
    case 'workout':
      return chart.name;
    case 'swap':
      return t('swap.title');
  }
}
