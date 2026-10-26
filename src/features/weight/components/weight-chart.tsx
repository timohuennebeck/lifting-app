import { useState } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle, Path } from 'react-native-svg';

import { daysBetween, fromIsoDate } from '@/shared/lib/date';
import { formatNumber, formatShortDate, type UnitSystem } from '@/shared/lib/format';
import { haptics } from '@/shared/lib/haptics';
import { colors } from '@/shared/lib/theme';
import { ChartGrid } from '@/shared/ui/chart-grid';
import { Text } from '@/shared/ui/text';
import { toUnits } from '@/shared/lib/body-weight';

import type { WeightPoint } from '../lib/trend';

const HEIGHT = 210;
/** Room between the chart's edge and the highest and lowest label. */
const PAD_Y = 15;
/** The first day's x, and the room on the right for the value labels. */
const LEFT = 16;
const LABELS = 58;
/** Value labels sit on whole kg or lb, at least three steps apart. */
const MIN_STEPS = 3;
const MAX_LABELS = 6;
const DAY_LABELS = 4;
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

/** Whole-number value labels around the shown weights, with the y of a value. */
function valueScale(values: number[]) {
  let lo = Math.floor(Math.min(...values));
  let hi = Math.ceil(Math.max(...values));
  while (hi - lo < MIN_STEPS) {
    if ((hi - lo) % 2) lo--;
    else hi++;
  }
  const step = Math.ceil((hi - lo) / (MAX_LABELS - 1));
  hi = lo + Math.ceil((hi - lo) / step) * step;
  const labels = Array.from({ length: (hi - lo) / step + 1 }, (_, i) => hi - i * step);
  const y = (value: number) => PAD_Y + ((hi - value) / (hi - lo)) * (HEIGHT - 2 * PAD_Y);
  return { labels, y };
}

/**
 * Daily weigh-ins as dots and the trend as a line over a grid (GW·2); tap or drag to pick a
 * weigh-in. Dates along the bottom, value labels on the right.
 */
export function WeightChart({ points, from, to, units, selected, onSelect }: WeightChartProps) {
  const [width, setWidth] = useState(0);
  const span = Math.max(1, daysBetween(from, to));
  const right = width - LABELS;
  const x = (date: string) => LEFT + (daysBetween(from, date) / span) * (right - LEFT);

  const values = points.flatMap((p) => [toUnits(p.weightKg, units), toUnits(p.trendKg, units)]);
  const scale = values.length ? valueScale(values) : null;
  const shown = points[selected ?? points.length - 1];
  // Each weigh-in's x once, not again (with its date parsed) on every finger move.
  const xs = points.map((p) => x(p.date));
  const trendLine = scale
    ? points
        .map((p, i) => `${i ? 'L' : 'M'}${xs[i]} ${scale.y(toUnits(p.trendKg, units))}`)
        .join('')
    : '';

  const pick = (touchX: number) => {
    if (!points.length) return;
    let best = 0;
    xs.forEach((px, i) => {
      if (Math.abs(px - touchX) < Math.abs(xs[best] - touchX)) best = i;
    });
    // Only a new weigh-in updates the screen around the chart.
    if (best === selected) return;
    haptics.select();
    onSelect(best);
  };
  const scrub = Gesture.Pan()
    .runOnJS(true)
    .hitSlop({ left: -BACK_SWIPE_EDGE })
    .minDistance(0)
    .activeOffsetX([-8, 8])
    .failOffsetY([-12, 12])
    .onBegin((e) => pick(e.x))
    .onUpdate((e) => pick(e.x));

  // Day labels at even steps across the range: the first under its start, the last ending at
  // the range's end, the others centred.
  const dayLabels = Array.from({ length: DAY_LABELS }, (_, i) => {
    const offset = (i / (DAY_LABELS - 1)) * span;
    const date = fromIsoDate(from);
    date.setDate(date.getDate() + Math.floor(offset));
    return { offset, text: formatShortDate(date) };
  });

  return (
    <View>
      <GestureDetector gesture={scrub}>
        <View style={{ height: HEIGHT }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
          {width > 0 ? (
            <Svg width={width} height={HEIGHT}>
              <ChartGrid id="weight-grid" width={width} height={HEIGHT} />
              {scale ? (
                <>
                  {points.map((p, i) =>
                    p === shown ? null : (
                      <Circle
                        key={p.id}
                        cx={xs[i]}
                        cy={scale.y(toUnits(p.weightKg, units))}
                        r={i === selected ? 4 : 2.25}
                        fill={colors.dim}
                      />
                    ),
                  )}
                  <Path
                    d={trendLine}
                    fill="none"
                    stroke={colors.accent}
                    strokeWidth={2.5}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {shown ? (
                    <>
                      <Circle
                        cx={x(shown.date)}
                        cy={scale.y(toUnits(shown.weightKg, units))}
                        r={4}
                        fill={colors.fg}
                      />
                      <Circle
                        cx={x(shown.date)}
                        cy={scale.y(toUnits(shown.trendKg, units))}
                        r={4.5}
                        fill={colors.accent}
                      />
                    </>
                  ) : null}
                </>
              ) : null}
            </Svg>
          ) : null}
          {scale && width > 0
            ? scale.labels.map((label) => (
                <Text
                  key={label}
                  variant="caption"
                  tone="subtle"
                  className="absolute text-xs leading-4 tabular-nums"
                  style={{ left: right + 8.5, top: scale.y(label) - 7 }}
                >
                  {formatNumber(label, 0)}
                </Text>
              ))
            : null}
        </View>
      </GestureDetector>
      <View className="mt-px h-4">
        {width > 0
          ? dayLabels.map(({ offset, text }, i) => {
              const at = LEFT + (offset / span) * (right - LEFT);
              const first = i === 0;
              const last = i === DAY_LABELS - 1;
              return (
                <Text
                  key={text}
                  variant="caption"
                  tone="subtle"
                  numberOfLines={1}
                  className={`absolute w-20 text-xs leading-4 ${first ? 'text-left' : last ? 'text-right' : 'text-center'}`}
                  style={{ left: first ? at : last ? at - 80 : at - 40 }}
                >
                  {text}
                </Text>
              );
            })
          : null}
      </View>
    </View>
  );
}
