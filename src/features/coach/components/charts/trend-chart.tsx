import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { daysBetween, fromIsoDate } from '@/shared/lib/date';
import { linePath, yScale } from '@/shared/lib/chart';
import { colors } from '@/shared/lib/theme';
import { ChartGrid } from '@/shared/ui/chart-grid';
import { Text } from '@/shared/ui/text';

import {
  type ChartPoint,
  formatAxisValue,
  formatChange,
  formatValue,
  niceTicks,
  type TrendChart as TrendChartData,
} from '../../lib/charts';
import { Headline, monthLabel, TimeAxis, timeLabels, useWidth } from './chart-parts';

const HEIGHT = 170;
/** Room for the value labels right of the chart. */
const AXIS = 40;
/** Room above the highest and below the lowest value. */
const PAD = 12;
/** So the end markers show whole at the edges. */
const X_PAD = 6;
/** Radius of a weigh-in's dot. */
const DOT = 2.2;

/**
 * One value over time (design CO3·1 "Verlauf"): body weight as grey measurements with the neon
 * trend through them, or an exercise's sessions as a neon line; records as neon dots.
 */
export function TrendChart({ chart }: { chart: TrendChartData }) {
  const { t } = useTranslation('coach');
  const [width, onLayout] = useWidth();
  const line = chart.line ?? chart.points;
  const first = line[0];
  const last = line.at(-1);
  if (!first || !last) return null;

  const plotted = [...line, ...(chart.line ? chart.points : [])].map((p) => p.value);
  const ticks = niceTicks(Math.min(...plotted), Math.max(...plotted));
  const min = Math.min(ticks[0], ...plotted);
  const max = Math.max(ticks.at(-1)!, ...plotted);
  const span = Math.max(1, daysBetween(first.date, last.date));
  const plotWidth = Math.max(0, width - AXIS);
  const x = (p: ChartPoint) =>
    X_PAD + (daysBetween(first.date, p.date) / span) * (plotWidth - 2 * X_PAD);
  const y = yScale(min, max, HEIGHT, PAD);
  const path = linePath(line, x, (p) => y(p.value));
  // Each weigh-in's dot as two half circles from its left edge, all in one path.
  const dot = `a${DOT} ${DOT} 0 1 0 ${2 * DOT} 0a${DOT} ${DOT} 0 1 0 ${-2 * DOT} 0`;
  const dots = chart.line
    ? chart.points.map((p) => `M${(x(p) - DOT).toFixed(1)} ${y(p.value).toFixed(1)}${dot}`).join('')
    : '';

  const caption =
    chart.metric === 'body_weight'
      ? t('trend.bodyWeight', { since: monthLabel(fromIsoDate(first.date)) })
      : t('trend.since', {
          what: t(`trend.metric.${chart.metric}`),
          since: monthLabel(fromIsoDate(first.date)),
        });
  const lastPoint = chart.points.at(-1);

  return (
    <View className="gap-3">
      <Headline
        value={formatValue(last.value, chart.unit, t)}
        change={formatChange(last.value - first.value, chart.unit, t)}
        caption={caption}
      />
      <View className="mt-3.5 gap-3">
        <View style={{ height: HEIGHT }} onLayout={onLayout}>
          {width > 0 ? (
            <>
              <Svg width={plotWidth} height={HEIGHT}>
                <ChartGrid id="coach-trend" width={plotWidth} height={HEIGHT} />
                {/* The weigh-ins: one shape for all of them, however many. */}
                {dots ? <Path d={dots} fill={colors.dim} /> : null}
                <Path
                  d={path}
                  stroke={colors.accent}
                  strokeWidth={2.5}
                  fill="none"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {(chart.records ?? []).map((p) => (
                  <Circle
                    key={`r${p.date}`}
                    cx={x(p)}
                    cy={y(p.value)}
                    r={3.5}
                    fill={colors.accent}
                    stroke={colors.bg}
                    strokeWidth={1.5}
                  />
                ))}
                {chart.line && lastPoint ? (
                  <Circle cx={x(lastPoint)} cy={y(lastPoint.value)} r={4} fill={colors.fg} />
                ) : null}
                <Circle cx={x(last)} cy={y(last.value)} r={5.5} fill={colors.accent} />
              </Svg>
              {ticks.map((tick) => (
                <Text
                  key={tick}
                  className="absolute right-0 font-inter-medium text-caption leading-4 text-subtle"
                  style={{ top: y(tick) - 8 }}
                >
                  {formatAxisValue(tick, chart.unit)}
                </Text>
              ))}
            </>
          ) : null}
        </View>
        <TimeAxis labels={timeLabels(first.date, last.date, 4)} inset={AXIS} />
      </View>
    </View>
  );
}
