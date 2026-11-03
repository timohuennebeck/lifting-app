import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { linePath, wholeNumberScale, yScale } from '@/shared/lib/chart';
import { daysBetween, fromIsoDate } from '@/shared/lib/date';
import { formatNumber, formatShortDate } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { ChartGrid } from '@/shared/ui/chart-grid';
import { Text } from '@/shared/ui/text';

import {
  type ChartPoint,
  formatChange,
  formatValue,
  type TrendChart as TrendChartData,
} from '../../lib/charts';
import { Headline, monthLabel, useWidth } from './chart-parts';

const HEIGHT = 170;
/** So the end markers show whole at the edges. */
const X_PAD = 7;
/** Body weight, as the weight chart: room for the value labels right, and above and below. */
const LABELS = 44;
const PAD_Y = 15;
/** An exercise, as its history chart: room above the highest and below the lowest value. */
const PAD = 10;
/** Radius of a weigh-in's dot. */
const DOT = 2.25;
/** Dates under a body weight chart, spread from its first day to its last. */
const DAY_LABELS = 4;

const dateOf = (point: ChartPoint) => formatShortDate(fromIsoDate(point.date));

/** A point's x between `left` and `right`, by its day from `first` over `span` days. */
const xOf = (first: string, span: number, left: number, right: number) => (p: ChartPoint) =>
  left + (daysBetween(first, p.date) / span) * (right - left);

/**
 * Body weight as the weight chart draws it: each weigh-in a grey dot, the neon trend through
 * them, the trend's end a ring and the last weigh-in white; whole numbers on the right and four
 * dates under it.
 */
function WeightTrend({
  points,
  line,
  width,
}: {
  points: ChartPoint[];
  line: ChartPoint[];
  width: number;
}) {
  const first = line[0];
  const last = line.at(-1)!;
  const lastWeighIn = points.at(-1);
  const span = Math.max(1, daysBetween(first.date, last.date));
  const right = width - LABELS;
  const x = xOf(first.date, span, X_PAD, right);
  const scale = wholeNumberScale(
    [...points, ...line].map((p) => p.value),
    HEIGHT,
    PAD_Y,
  );
  // Each weigh-in's dot as two half circles from its left edge, all in one path.
  const dot = `a${DOT} ${DOT} 0 1 0 ${2 * DOT} 0a${DOT} ${DOT} 0 1 0 ${-2 * DOT} 0`;
  const dots = points
    .map((p) => `M${(x(p) - DOT).toFixed(1)} ${scale.y(p.value).toFixed(1)}${dot}`)
    .join('');
  const days = Array.from({ length: DAY_LABELS }, (_, i) => {
    const offset = Math.floor((i / (DAY_LABELS - 1)) * span);
    const date = fromIsoDate(first.date);
    date.setDate(date.getDate() + offset);
    return { at: X_PAD + (offset / span) * (right - X_PAD), text: formatShortDate(date) };
  });

  return (
    <View>
      <View style={{ height: HEIGHT }}>
        <Svg width={width} height={HEIGHT}>
          <ChartGrid id="coach-weight" width={width} height={HEIGHT} />
          {/* The weigh-ins: one shape for all of them, however many. */}
          <Path d={dots} fill={colors.dim} />
          <Path
            d={linePath(line, x, (p) => scale.y(p.value))}
            fill="none"
            stroke={colors.accent}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* The last weigh-in white, then the trend's end as a ring on top, as the exercise
              charts mark a session: it stays a clean ring where the two meet. */}
          {lastWeighIn ? (
            <Circle cx={x(lastWeighIn)} cy={scale.y(lastWeighIn.value)} r={4} fill={colors.fg} />
          ) : null}
          <Circle
            cx={x(last)}
            cy={scale.y(last.value)}
            r={5}
            fill={colors.bg}
            stroke={colors.accent}
            strokeWidth={2.5}
          />
        </Svg>
        {scale.labels.map((label) => (
          <Text
            key={label}
            variant="caption"
            tone="subtle"
            className="absolute text-xs leading-4 tabular-nums"
            style={{ left: right + 8.5, top: scale.y(label) - 7 }}
          >
            {formatNumber(label, 0)}
          </Text>
        ))}
      </View>
      <View className="mt-px h-4">
        {days.map(({ at, text }, i) => {
          const firstLabel = i === 0;
          const lastLabel = i === DAY_LABELS - 1;
          return (
            <Text
              key={text}
              variant="caption"
              tone="subtle"
              numberOfLines={1}
              className={`absolute w-20 text-xs leading-4 ${firstLabel ? 'text-left' : lastLabel ? 'text-right' : 'text-center'}`}
              style={{ left: firstLabel ? at : lastLabel ? at - 80 : at - 40 }}
            >
              {text}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

/**
 * An exercise (or the body check's score) as its history chart draws it: a neon line with the
 * neon fading out under it, the last session as a ring, and the first and last date under it.
 */
function SessionTrend({ points, width }: { points: ChartPoint[]; width: number }) {
  const first = points[0];
  const last = points.at(-1)!;
  const span = Math.max(1, daysBetween(first.date, last.date));
  const x = xOf(first.date, span, X_PAD, width - X_PAD);
  const values = points.map((p) => p.value);
  const y = yScale(Math.min(...values), Math.max(...values), HEIGHT, PAD);
  const line = linePath(points, x, (p) => y(p.value));
  const area = `${line} L${x(last).toFixed(1)} ${HEIGHT} L${x(first).toFixed(1)} ${HEIGHT} Z`;

  return (
    <View className="gap-3">
      <Svg width={width} height={HEIGHT} style={{ overflow: 'visible' }}>
        <ChartGrid id="coach-trend" width={width} height={HEIGHT} />
        <Defs>
          <LinearGradient id="coach-trend-fill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.accent} stopOpacity={0.22} />
            <Stop offset="1" stopColor={colors.accent} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Path d={area} fill="url(#coach-trend-fill)" />
        <Path
          d={line}
          fill="none"
          stroke={colors.accent}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <Circle
          cx={x(last)}
          cy={y(last.value)}
          r={5}
          fill={colors.bg}
          stroke={colors.accent}
          strokeWidth={2.5}
        />
      </Svg>
      <View className="h-5 flex-row items-center justify-between">
        <Text className="font-inter-semibold text-[11px] leading-3.5 text-dim">
          {dateOf(first)}
        </Text>
        <Text className="font-inter-semibold text-[11px] leading-3.5 text-dim">{dateOf(last)}</Text>
      </View>
    </View>
  );
}

/**
 * One value over time (design CO3·1 "Verlauf"), drawn as the app draws it elsewhere: body weight
 * like the weight chart, an exercise like its history chart.
 */
export function TrendChart({ chart }: { chart: TrendChartData }) {
  const { t } = useTranslation('coach');
  const [width, onLayout] = useWidth();
  const line = chart.line ?? chart.points;
  const first = line[0];
  const last = line.at(-1);
  if (!first || !last) return null;

  const caption =
    chart.metric === 'body_weight'
      ? t('trend.bodyWeight', { since: monthLabel(fromIsoDate(first.date)) })
      : t('trend.since', {
          what: t(`trend.metric.${chart.metric}`),
          since: monthLabel(fromIsoDate(first.date)),
        });

  return (
    <View className="gap-3">
      <Headline
        value={formatValue(last.value, chart.unit, t)}
        change={formatChange(last.value - first.value, chart.unit, t)}
        caption={caption}
      />
      <View className="mt-3.5" onLayout={onLayout}>
        {width > 0 ? (
          chart.line ? (
            <WeightTrend points={chart.points} line={chart.line} width={width} />
          ) : (
            <SessionTrend points={chart.points} width={width} />
          )
        ) : null}
      </View>
    </View>
  );
}
