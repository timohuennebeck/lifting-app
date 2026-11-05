import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Svg from 'react-native-svg';

import { WeightPlot } from '@/shared/components/weight-plot';
import { useWidth } from '@/shared/hooks/use-width';
import { buildLineChart, chartBounds, nearestIndex } from '@/shared/lib/chart';
import { daysBetween, fromIsoDate } from '@/shared/lib/date';
import { formatShortDate } from '@/shared/lib/format';
import { AreaLine } from '@/shared/ui/area-line';
import { ChartGrid } from '@/shared/ui/chart-grid';
import { HoldLine, Ring } from '@/shared/ui/chart-marks';
import { Text } from '@/shared/ui/text';

import {
  type ChartPoint,
  formatChange,
  formatValue,
  type TrendChart as TrendChartData,
} from '../../lib/charts';
import { Headline, holdGesture, monthLabel } from './chart-parts';

const HEIGHT = 170;
/** Body weight, as the weight chart: the first day's x, and room for the value labels right. */
const LEFT = 7;
const LABELS = 44;

const dateOf = (point: ChartPoint) => formatShortDate(fromIsoDate(point.date));

interface SessionTrendProps {
  points: ChartPoint[];
  width: number;
  /** The point held, by its index; null for the last. */
  picked: number | null;
  onPick: (index: number | null) => void;
}

/**
 * An exercise (or the body check's score) as its history chart draws it: a neon line with the
 * neon fading out under it, the session shown as a ring, and the first and last date under it.
 */
function SessionTrend({ points, width, picked, onPick }: SessionTrendProps) {
  const first = points[0];
  // Placed by their day, over at least one day.
  const days = points.map((p) => ({ time: daysBetween(first.date, p.date), value: p.value }));
  const bounds = chartBounds(days)!;
  const plot = buildLineChart(days, width, HEIGHT, { ...bounds, t1: Math.max(bounds.t1, 1) });
  const shown = plot.points[picked ?? plot.points.length - 1];
  const xs = plot.points.map((p) => p.x);

  return (
    <View className="gap-3">
      <GestureDetector gesture={holdGesture((at) => nearestIndex(xs, at), picked, onPick)}>
        <View style={{ height: HEIGHT }}>
          <Svg width={width} height={HEIGHT} style={{ overflow: 'visible' }}>
            <ChartGrid id="coach-trend" width={width} height={HEIGHT} />
            <AreaLine id="coach-trend-fill" line={plot.line} area={plot.area} />
          </Svg>
          {picked !== null ? <HoldLine x={shown.x} height={HEIGHT} /> : null}
          <Ring x={shown.x} y={shown.y} />
        </View>
      </GestureDetector>
      <View className="h-5 flex-row items-center justify-between">
        <Text className="font-inter-semibold text-[11px] leading-3.5 text-dim">
          {dateOf(first)}
        </Text>
        <Text className="font-inter-semibold text-[11px] leading-3.5 text-dim">
          {dateOf(points.at(-1)!)}
        </Text>
      </View>
    </View>
  );
}

/**
 * One value over time (design CO3·1 "Verlauf"), drawn as the app draws it elsewhere: body weight
 * like the weight chart, an exercise like its history chart. A finger held on it reads a point.
 */
export function TrendChart({ chart }: { chart: TrendChartData }) {
  const { t } = useTranslation('coach');
  const [width, onLayout] = useWidth();
  const [picked, setPicked] = useState<number | null>(null);
  const line = chart.line ?? chart.points;
  const first = line[0];
  const last = line.at(-1);
  if (!first || !last) return null;

  const shown = picked === null ? last : line[picked];
  const what = t(`trend.metric.${chart.metric}`);
  const since = monthLabel(fromIsoDate(first.date));
  let caption = t('trend.since', { what, since });
  if (chart.metric === 'body_weight') caption = t('trend.bodyWeight', { since });
  if (picked !== null) caption = `${what} · ${dateOf(shown)}`;

  return (
    <View className="gap-3">
      <Headline
        value={formatValue(shown.value, chart.unit, t)}
        change={formatChange(shown.value - first.value, chart.unit, t)}
        caption={caption}
      />
      <View className="mt-3.5" onLayout={onLayout}>
        {width > 0 ? (
          chart.line ? (
            <WeightPlot
              weighIns={chart.points}
              trend={chart.line}
              from={first.date}
              to={last.date}
              width={width}
              height={HEIGHT}
              left={LEFT}
              labelWidth={LABELS}
              picked={picked}
              gesture={(indexAt) => holdGesture(indexAt, picked, setPicked)}
              holdLine
              datesOnDays
            />
          ) : (
            <SessionTrend points={chart.points} width={width} picked={picked} onPick={setPicked} />
          )
        ) : null}
      </View>
    </View>
  );
}
