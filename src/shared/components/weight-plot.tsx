import { View } from 'react-native';
import { GestureDetector, type GestureType } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';

import { linePath, nearestIndex, wholeNumberScale } from '@/shared/lib/chart';
import { daysBetween, fromIsoDate } from '@/shared/lib/date';
import { formatNumber, formatShortDate } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { ChartGrid } from '@/shared/ui/chart-grid';
import { HoldLine, Ring } from '@/shared/ui/chart-marks';
import { Text } from '@/shared/ui/text';

/** Room between the plot's edge and the highest and lowest label. */
const PAD_Y = 15;
const DAY_LABELS = 4;
/** Radius of a weigh-in's dot, and of the shown one. */
const DOT = 2.25;
const SHOWN_DOT = 4;
const LAYER = { position: 'absolute', left: 0, top: 0 } as const;

/** A dot as part of one SVG path: a single native view, however many weigh-ins there are. */
const dotPath = (x: number, y: number) =>
  `M${(x - DOT).toFixed(1)} ${y.toFixed(1)}a${DOT} ${DOT} 0 1 0 ${2 * DOT} 0a${DOT} ${DOT} 0 1 0 ${-2 * DOT} 0`;

export interface DayValue {
  /** ISO date. */
  date: string;
  value: number;
}

export interface WeightPlotProps {
  /** The weigh-ins, oldest first. */
  weighIns: DayValue[];
  /** The trend through them, oldest first. */
  trend: DayValue[];
  /** The first and last day across the plot (ISO dates). */
  from: string;
  to: string;
  width: number;
  height: number;
  /** The first day's x, and the room on the right for the value labels. */
  left: number;
  labelWidth: number;
  /** The trend point shown, by its index; null for the latest. */
  picked: number | null;
  /** The finger's gesture, given what lies under an x: the nearest trend point, null for none. */
  gesture: (indexAt: (x: number) => number | null) => GestureType;
  /** A line down the plot at the point a finger holds. */
  holdLine?: boolean;
  /** Each date under its own day; otherwise the dates are spread evenly. */
  datesOnDays?: boolean;
}

/**
 * Body weight over a grid (the weight screen, Kai's answers): each weigh-in a grey dot, the neon
 * trend through them, the point shown a ring on the trend and its weigh-in white; whole numbers on
 * the right and four dates under it.
 */
export function WeightPlot({
  weighIns,
  trend,
  from,
  to,
  width,
  height,
  left,
  labelWidth,
  picked,
  gesture,
  holdLine = false,
  datesOnDays = false,
}: WeightPlotProps) {
  const span = Math.max(1, daysBetween(from, to));
  const right = width - labelWidth;
  const xAt = (day: number) => left + (day / span) * (right - left);

  const values = [...weighIns, ...trend].map((p) => p.value);
  const scale = values.length ? wholeNumberScale(values, height, PAD_Y) : null;
  // Each point's x once, not again (with its date parsed) on every finger move.
  const xs = trend.map((p) => xAt(daysBetween(from, p.date)));
  const dotXs = weighIns.map((p) => xAt(daysBetween(from, p.date)));
  const dots = scale ? weighIns.map((p, i) => dotPath(dotXs[i], scale.y(p.value))).join('') : '';
  const trendLine = scale
    ? linePath(
        trend,
        (_, i) => xs[i],
        (p) => scale.y(p.value),
      )
    : '';
  const shownAt = picked ?? trend.length - 1;
  const shown = trend[shownAt];
  // The weigh-in nearest the point shown.
  const weighInAt = nearestIndex(dotXs, xs[shownAt]);
  const weighIn = weighIns[weighInAt];

  // The first date under the plot's start, the last ending at its end, the others centred.
  const dayLabels = Array.from({ length: DAY_LABELS }, (_, i) => {
    const offset = (i / (DAY_LABELS - 1)) * span;
    const date = fromIsoDate(from);
    date.setDate(date.getDate() + Math.floor(offset));
    return { at: xAt(datesOnDays ? Math.floor(offset) : offset), text: formatShortDate(date) };
  });

  return (
    <View>
      <GestureDetector gesture={gesture((x) => (xs.length ? nearestIndex(xs, x) : null))}>
        <View style={{ height }}>
          {/* Layers, as any change inside an Svg redraws all of it: the grid stays as it is, the
              data changes with the range, and the marker is views a finger only moves. */}
          {width > 0 ? (
            <Svg width={width} height={height} style={LAYER}>
              <ChartGrid id="weight-grid" width={width} height={height} />
            </Svg>
          ) : null}
          {scale && width > 0 ? (
            <Svg width={width} height={height} style={LAYER}>
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
          {holdLine && picked !== null ? <HoldLine x={xs[shownAt]} height={height} /> : null}
          {/* The weigh-in white, then the trend there as a ring on top, as the exercise charts
              mark a session: it stays a clean ring where the two meet. */}
          {scale && shown && width > 0 ? (
            <>
              {weighIn ? (
                <View
                  className="absolute rounded-full bg-fg"
                  style={{
                    left: dotXs[weighInAt] - SHOWN_DOT,
                    top: scale.y(weighIn.value) - SHOWN_DOT,
                    width: 2 * SHOWN_DOT,
                    height: 2 * SHOWN_DOT,
                  }}
                />
              ) : null}
              <Ring x={xs[shownAt]} y={scale.y(shown.value)} />
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
          ? dayLabels.map(({ at, text }, i) => {
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
