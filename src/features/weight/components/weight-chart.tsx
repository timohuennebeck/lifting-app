import { View } from 'react-native';

import { WeightPlot } from '@/shared/components/weight-plot';
import { useWidth } from '@/shared/hooks/use-width';
import { toUnits } from '@/shared/lib/body-weight';
import type { UnitSystem } from '@/shared/lib/format';
import { scrubGesture } from '@/shared/lib/scrub-gesture';

import type { WeightPoint } from '../lib/trend';

const HEIGHT = 210;
/** The first day's x, and the room on the right for the value labels. */
const LEFT = 16;
const LABELS = 58;
/**
 * The chart spans the screen from its left edge: a drag starting this close to it is iOS's swipe
 * back, not a scrub (as the back swipe also wins over scroll views there).
 */
const BACK_SWIPE_EDGE = 20;

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

/**
 * Daily weigh-ins as dots and the trend as a line over a grid (GW·2); tap or drag to pick a
 * weigh-in. Dates along the bottom, value labels on the right.
 */
export function WeightChart({ points, from, to, units, selected, onSelect }: WeightChartProps) {
  const [width, onLayout] = useWidth();
  const weighIns = points.map((p) => ({ date: p.date, value: toUnits(p.weightKg, units) }));
  const trend = points.map((p) => ({ date: p.date, value: toUnits(p.trendKg, units) }));
  // The weigh-in picked stays; only a new one updates the screen around the chart.
  const scrub = (indexAt: (x: number) => number | null) =>
    scrubGesture({
      indexAt,
      picked: selected,
      onPick: (index) => {
        if (index !== null) onSelect(index);
      },
      keep: true,
    })
      .hitSlop({ left: -BACK_SWIPE_EDGE })
      .activeOffsetX([-8, 8])
      .failOffsetY([-12, 12]);

  return (
    <View onLayout={onLayout}>
      <WeightPlot
        weighIns={weighIns}
        trend={trend}
        from={from}
        to={to}
        width={width}
        height={HEIGHT}
        left={LEFT}
        labelWidth={LABELS}
        picked={selected}
        gesture={scrub}
      />
    </View>
  );
}
