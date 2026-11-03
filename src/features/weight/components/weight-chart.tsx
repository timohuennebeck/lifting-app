import { useState } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';

import { linePath, nearestIndex, wholeNumberScale } from '@/shared/lib/chart';
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
const DAY_LABELS = 4;
/**
 * The chart spans the screen from its left edge: a drag starting this close to it is iOS's swipe
 * back, not a scrub (as the back swipe also wins over scroll views there).
 */
const BACK_SWIPE_EDGE = 20;
/** Radius of a weigh-in's dot, of the shown one, and outer radius of the trend's ring there. */
const DOT = 2.25;
const SHOWN_DOT = 4;
const RING = 6.25;
const LAYER = { position: 'absolute', left: 0, top: 0 } as const;

/** A dot as part of one SVG path: a single native view, however many weigh-ins there are. */
const dotPath = (x: number, y: number) =>
  `M${(x - DOT).toFixed(1)} ${y.toFixed(1)}a${DOT} ${DOT} 0 1 0 ${2 * DOT} 0a${DOT} ${DOT} 0 1 0 ${-2 * DOT} 0`;

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
  const [width, setWidth] = useState(0);
  const span = Math.max(1, daysBetween(from, to));
  const right = width - LABELS;
  const x = (date: string) => LEFT + (daysBetween(from, date) / span) * (right - LEFT);

  const values = points.flatMap((p) => [toUnits(p.weightKg, units), toUnits(p.trendKg, units)]);
  const scale = values.length ? wholeNumberScale(values, HEIGHT, PAD_Y) : null;
  const shown = points[selected ?? points.length - 1];
  // Each weigh-in's x once, not again (with its date parsed) on every finger move.
  const xs = points.map((p) => x(p.date));
  const dots = scale
    ? points.map((p, i) => dotPath(xs[i], scale.y(toUnits(p.weightKg, units)))).join('')
    : '';
  const trendLine = scale
    ? linePath(
        points,
        (_, i) => xs[i],
        (p) => scale.y(toUnits(p.trendKg, units)),
      )
    : '';

  const pick = (touchX: number) => {
    if (!points.length) return;
    const best = nearestIndex(xs, touchX);
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
          {/* Layers, as any change inside an Svg redraws all of it: the grid stays as it is, the
              data changes with the range, and the marker is views a finger only moves. */}
          {width > 0 ? (
            <Svg width={width} height={HEIGHT} style={LAYER}>
              <ChartGrid id="weight-grid" width={width} height={HEIGHT} />
            </Svg>
          ) : null}
          {scale && width > 0 ? (
            <Svg width={width} height={HEIGHT} style={LAYER}>
              <Path d={dots} fill={colors.dim} />
              <Path
                d={trendLine}
                fill="none"
                stroke={colors.accent}
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </Svg>
          ) : null}
          {/* The weigh-in white, then the trend there as a ring on top, as the exercise charts
              mark a session: it stays a clean ring where the two meet. */}
          {scale && shown && width > 0 ? (
            <>
              <View
                className="absolute rounded-full bg-fg"
                style={{
                  left: x(shown.date) - SHOWN_DOT,
                  top: scale.y(toUnits(shown.weightKg, units)) - SHOWN_DOT,
                  width: 2 * SHOWN_DOT,
                  height: 2 * SHOWN_DOT,
                }}
              />
              <View
                className="absolute rounded-full border-[2.5px] border-accent bg-bg"
                style={{
                  left: x(shown.date) - RING,
                  top: scale.y(toUnits(shown.trendKg, units)) - RING,
                  width: 2 * RING,
                  height: 2 * RING,
                }}
              />
            </>
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
