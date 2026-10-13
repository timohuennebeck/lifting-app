import { useState } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';

import { daysBetween, fromIsoDate } from '@/shared/lib/date';
import { formatNumber, formatShortDate, type UnitSystem } from '@/shared/lib/format';
import { haptics } from '@/shared/lib/haptics';
import { colors } from '@/shared/lib/theme';
import { Text } from '@/shared/ui/text';
import { toUnits } from '@/shared/lib/body-weight';

import type { WeightPoint } from '../lib/trend';

const HEIGHT = 210;
/** Room between the chart's edge and the highest and lowest label. */
const PAD_Y = 15;
const GRID = 14;
/** The first day's x, and the room on the right for the value labels. */
const LEFT = 16;
const LABELS = 58;
/** Value labels sit on whole kg or lb, at least three steps apart. */
const MIN_STEPS = 3;
const MAX_LABELS = 6;
const DAY_LABELS = 4;

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
  const trendLine = scale
    ? points
        .map((p, i) => `${i ? 'L' : 'M'}${x(p.date)} ${scale.y(toUnits(p.trendKg, units))}`)
        .join('')
    : '';

  const pick = (touchX: number) => {
    if (!points.length) return;
    let best = 0;
    points.forEach((p, i) => {
      if (Math.abs(x(p.date) - touchX) < Math.abs(x(points[best].date) - touchX)) best = i;
    });
    if (best !== selected) haptics.select();
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
              <Defs>
                {/* The grid fades out towards the screen edges; the data doesn't. */}
                <LinearGradient
                  id="weight-grid"
                  gradientUnits="userSpaceOnUse"
                  x1={12}
                  y1={0}
                  x2={width - 12}
                  y2={0}
                >
                  <Stop offset={0} stopColor={colors.chip} stopOpacity={0} />
                  <Stop offset={0.18} stopColor={colors.chip} stopOpacity={1} />
                  <Stop offset={0.82} stopColor={colors.chip} stopOpacity={1} />
                  <Stop offset={1} stopColor={colors.chip} stopOpacity={0} />
                </LinearGradient>
              </Defs>
              <G stroke="url(#weight-grid)" strokeWidth={1}>
                {Array.from({ length: HEIGHT / GRID + 1 }, (_, i) => (
                  <Path key={`h${i}`} d={`M12 ${i * GRID + 0.5}H${width - 12}`} />
                ))}
                {Array.from({ length: Math.floor((width - 40) / GRID) + 1 }, (_, i) => (
                  <Path key={`v${i}`} d={`M${20 + i * GRID + 0.5} 0V${HEIGHT}`} />
                ))}
              </G>
              {scale ? (
                <>
                  {points.map((p, i) =>
                    p === shown ? null : (
                      <Circle
                        key={p.id}
                        cx={x(p.date)}
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
