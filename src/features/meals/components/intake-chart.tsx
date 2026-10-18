import { TrendChart } from '@/shared/ui/trend-chart';

import type { IntakePoint } from '../lib/intake';

/** The labels span at least this many kcal, so a steady week isn't drawn as wild swings. */
const MIN_SPAN_KCAL = 400;
const MAX_LABELS = 6;
/** Steps the labels may sit apart, in kcal. */
const STEPS = [50, 100, 200, 250, 500, 1000, 2000, 2500, 5000];

/** Labels on round kcal around the shown values, from the highest down; never below 0. */
function kcalLabels(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, MIN_SPAN_KCAL);
  // At most four steps across the values: rounding out to whole steps adds up to two.
  const step = STEPS.find((s) => span / s <= MAX_LABELS - 2) ?? STEPS[STEPS.length - 1];
  const middle = (min + max) / 2;
  const lo = Math.max(0, Math.floor(Math.min(min, middle - span / 2) / step) * step);
  const hi = Math.ceil(Math.max(max, middle + span / 2) / step) * step;
  return Array.from({ length: (hi - lo) / step + 1 }, (_, i) => hi - i * step);
}

export interface IntakeChartProps {
  /** The logged days shown, oldest first. */
  points: IntakePoint[];
  /** First and last day of the range (ISO dates). */
  from: string;
  to: string;
  /** The day picked by tapping, or null for the latest. */
  selected: number | null;
  onSelect: (index: number) => void;
}

/** Each logged day's kcal as a dot and its 7-day average as the line (the weight chart's look). */
export function IntakeChart({ points, from, to, selected, onSelect }: IntakeChartProps) {
  const shown = points.map((p) => ({
    key: p.date,
    date: p.date,
    value: p.kcal,
    trend: p.averageKcal,
  }));
  return (
    <TrendChart
      id="meals-grid"
      points={shown}
      from={from}
      to={to}
      labels={kcalLabels}
      selected={selected}
      onSelect={onSelect}
    />
  );
}
