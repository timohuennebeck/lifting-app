import { useState } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle, Path } from 'react-native-svg';

import { daysBetween, fromIsoDate } from '@/shared/lib/date';
import { formatNumber, formatShortDate } from '@/shared/lib/format';
import { haptics } from '@/shared/lib/haptics';
import { colors } from '@/shared/lib/theme';

import { ChartGrid } from './chart-grid';
import { Text } from './text';

const HEIGHT = 210;
/** Room between the chart's edge and the highest and lowest label. */
const PAD_Y = 15;
/** The first day's x, and the room on the right for the value labels. */
const LEFT = 16;
const LABELS = 58;
const DAY_LABELS = 4;

export interface TrendPoint {
  /** Unique among the points, e.g. the entry's id or its day. */
  key: string;
  /** The day (ISO date). */
  date: string;
  /** The day's own value, drawn as a dot. */
  value: number;
  /** The smoothed value through it, drawn as the line. */
  trend: number;
}

export interface TrendChartProps {
  /** Unique within the screen: the grid's gradients are looked up by it. */
  id: string;
  /** The days shown, oldest first. */
  points: TrendPoint[];
  /** First and last day of the range (ISO dates). */
  from: string;
  to: string;
  /** Value labels from the highest down, spanning every value given. */
  labels: (values: number[]) => number[];
  /** A value label's text; whole numbers by default. */
  formatLabel?: (value: number) => string;
  /** The point picked by tapping, or null for the latest. */
  selected: number | null;
  onSelect: (index: number) => void;
}

const wholeNumber = (value: number) => formatNumber(value, 0);

/**
 * Each day's value as a dot and the trend as a line over a grid (weight history, meals); tap or
 * drag to pick a day. Dates along the bottom, value labels on the right.
 */
export function TrendChart({
  id,
  points,
  from,
  to,
  labels: labelsFor,
  formatLabel = wholeNumber,
  selected,
  onSelect,
}: TrendChartProps) {
  const [width, setWidth] = useState(0);
  const span = Math.max(1, daysBetween(from, to));
  const right = width - LABELS;
  const x = (date: string) => LEFT + (daysBetween(from, date) / span) * (right - LEFT);

  const labels = points.length ? labelsFor(points.flatMap((p) => [p.value, p.trend])) : [];
  const hi = labels[0] ?? 0;
  const lo = labels.at(-1) ?? 0;
  const y = (value: number) => PAD_Y + ((hi - value) / (hi - lo || 1)) * (HEIGHT - 2 * PAD_Y);
  const shown = points[selected ?? points.length - 1];
  // Each point's x once, not again (with its date parsed) on every finger move.
  const xs = points.map((p) => x(p.date));
  const trendLine = points.map((p, i) => `${i ? 'L' : 'M'}${xs[i]} ${y(p.trend)}`).join('');

  const pick = (touchX: number) => {
    if (!points.length) return;
    let best = 0;
    xs.forEach((px, i) => {
      if (Math.abs(px - touchX) < Math.abs(xs[best] - touchX)) best = i;
    });
    // Only a new point updates the screen around the chart.
    if (best === selected) return;
    haptics.select();
    onSelect(best);
  };
  const scrub = Gesture.Pan()
    .runOnJS(true)
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
              <ChartGrid id={id} width={width} height={HEIGHT} />
              {points.map((p, i) =>
                p === shown ? null : (
                  <Circle key={p.key} cx={xs[i]} cy={y(p.value)} r={2.25} fill={colors.dim} />
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
                  <Circle cx={x(shown.date)} cy={y(shown.value)} r={4} fill={colors.fg} />
                  <Circle cx={x(shown.date)} cy={y(shown.trend)} r={4.5} fill={colors.accent} />
                </>
              ) : null}
            </Svg>
          ) : null}
          {width > 0
            ? labels.map((label) => (
                <Text
                  key={label}
                  variant="caption"
                  tone="subtle"
                  className="absolute text-xs leading-4 tabular-nums"
                  style={{ left: right + 8.5, top: y(label) - 7 }}
                >
                  {formatLabel(label)}
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
