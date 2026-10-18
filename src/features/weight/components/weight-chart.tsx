import { toUnits } from '@/shared/lib/body-weight';
import type { UnitSystem } from '@/shared/lib/format';
import { TrendChart } from '@/shared/ui/trend-chart';

import type { WeightPoint } from '../lib/trend';

/** Value labels sit on whole kg or lb, at least three steps apart. */
const MIN_STEPS = 3;
const MAX_LABELS = 6;

/** Whole-number value labels around the shown weights, from the highest down. */
function valueLabels(values: number[]) {
  let lo = Math.floor(Math.min(...values));
  let hi = Math.ceil(Math.max(...values));
  while (hi - lo < MIN_STEPS) {
    if ((hi - lo) % 2) lo--;
    else hi++;
  }
  const step = Math.ceil((hi - lo) / (MAX_LABELS - 1));
  hi = lo + Math.ceil((hi - lo) / step) * step;
  return Array.from({ length: (hi - lo) / step + 1 }, (_, i) => hi - i * step);
}

export interface WeightChartProps {
  /** The weigh-ins shown, oldest first. */
  points: WeightPoint[];
  /** First and last day of the range (ISO dates). */
  from: string;
  to: string;
  units: UnitSystem;
  /** The weigh-in picked by tapping, or null for the latest. */
  selected: number | null;
  onSelect: (index: number) => void;
}

/** Daily weigh-ins as dots and the trend as a line, in the user's unit (GW·2). */
export function WeightChart({ points, from, to, units, selected, onSelect }: WeightChartProps) {
  const shown = points.map((p) => ({
    key: p.id,
    date: p.date,
    value: toUnits(p.weightKg, units),
    trend: toUnits(p.trendKg, units),
  }));
  return (
    <TrendChart
      id="weight-grid"
      points={shown}
      from={from}
      to={to}
      labels={valueLabels}
      selected={selected}
      onSelect={onSelect}
    />
  );
}
