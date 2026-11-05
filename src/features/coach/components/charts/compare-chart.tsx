import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';

import { ExerciseThumb } from '@/features/exercises/components/exercise-thumb';
import { useExerciseName } from '@/shared/data/exercises';
import { useWidth } from '@/shared/hooks/use-width';
import { cn } from '@/shared/lib/cn';
import { daysBetween, fromIsoDate } from '@/shared/lib/date';
import { linePath, nearestIndex, yScale } from '@/shared/lib/chart';
import { formatShortDate } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { ChartGrid } from '@/shared/ui/chart-grid';
import { HoldLine, Ring } from '@/shared/ui/chart-marks';
import { Text } from '@/shared/ui/text';

import {
  type CompareChart as CompareChartData,
  formatAxisValue,
  formatChange,
  formatValue,
} from '../../lib/charts';
import { holdGesture, monthLabel, TimeAxis } from './chart-parts';

const HEIGHT = 170;
/** Right of the lines: each line's last value and name. */
const LABELS = 70;
const PAD = 12;
/** Labels closer than this push apart. */
const LABEL_GAP = 30;
/** The date under a finger held on the chart. */
const HELD_DATE = 96;
/** Line colours in order, with their value labels' colour. */
const SERIES = [
  { line: colors.fg, label: 'text-fg' },
  { line: colors.accent, label: 'text-accent' },
  { line: colors.subtle, label: 'text-subtle' },
  { line: colors.dim, label: 'text-dim' },
] as const;

/** A series as % of its first value when asked for ("Start = 100 %"). */
const valuesOf = (values: number[], asPercent: boolean) =>
  asPercent && values[0] ? values.map((v) => (v / values[0] - 1) * 100) : values;

function ExerciseLabel({
  exerciseId,
  value,
  color,
}: {
  exerciseId: string;
  value: string;
  color: string;
}) {
  const { i18n } = useTranslation();
  const name = useExerciseName(exerciseId, i18n.language);
  return (
    <>
      <Text className={cn('font-inter-bold text-sm leading-[15.4px]', color)}>{value}</Text>
      <Text className="font-inter-semibold text-[10px] leading-3 text-subtle">{name}</Text>
    </>
  );
}

interface RowProps {
  exerciseId: string;
  color: string;
  from: string;
  to: string;
  change: string;
  first: boolean;
}

function ExerciseRow({ exerciseId, color, from, to, change, first }: RowProps) {
  const { i18n } = useTranslation();
  const name = useExerciseName(exerciseId, i18n.language);
  return (
    <View
      className={cn('flex-row items-center gap-3 py-[8.5px]', !first && 'border-t border-chip')}
    >
      <View>
        <ExerciseThumb exerciseId={exerciseId} name={name} className="h-13 w-10 rounded-[5px]" />
        <View
          className="absolute -right-[3px] -bottom-[3px] size-3 rounded-full border-2 border-bg"
          style={{ backgroundColor: color }}
        />
      </View>
      <Text numberOfLines={1} className="min-w-0 flex-1 font-inter-medium text-sm text-fg">
        {name}
      </Text>
      <Text className="font-inter text-caption leading-4 text-subtle">{`${from} → ${to}`}</Text>
      <Text className="w-12 text-right font-inter-semibold text-caption leading-4 text-accent">
        {change}
      </Text>
    </View>
  );
}

/**
 * Two to four exercises over the same time (design CO3·2 "Vergleich"): a line each with its last
 * value, or the one at a finger held on the chart, then a row per exercise from first to last value.
 */
export function CompareChart({ chart }: { chart: CompareChartData }) {
  const { t } = useTranslation('coach');
  const [width, onLayout] = useWidth();
  const [picked, setPicked] = useState<number | null>(null);
  // Each exercise with its colours and the values it is drawn at.
  const series = chart.series
    .filter((s) => s.points.length)
    .map((s, i) => ({
      ...s,
      colors: SERIES[i % SERIES.length],
      shown: valuesOf(
        s.points.map((p) => p.value),
        chart.asPercent,
      ),
    }));
  if (!series.length) return null;
  const dates = series.flatMap((s) => s.points.map((p) => p.date)).sort();
  const firstDay = dates[0];
  const lastDay = dates.at(-1)!;
  const span = Math.max(1, daysBetween(firstDay, lastDay));
  const all = series.flatMap((s) => s.shown);
  const min = Math.min(...all);
  const max = Math.max(...all);
  const plotWidth = Math.max(0, width - LABELS);
  const x = (date: string) => 4 + (daysBetween(firstDay, date) / span) * (plotWidth - 8);
  const y = yScale(min, max, HEIGHT, PAD);
  const days = [...new Set(dates)];
  const dayXs = days.map(x);
  const held = picked === null ? null : { day: days[picked], x: dayXs[picked] };
  // Which point of each line shows: its last, or the one nearest to the day held.
  const shownAt = series.map((s) =>
    held
      ? nearestIndex(
          s.points.map((p) => x(p.date)),
          held.x,
        )
      : s.points.length - 1,
  );

  // Each line's label, moved apart where they would overlap.
  const labels = series
    .map((s, i) => ({ i, top: y(s.shown[shownAt[i]]) - 14 }))
    .sort((a, b) => a.top - b.top);
  labels.forEach((label, k) => {
    if (k > 0) label.top = Math.max(label.top, labels[k - 1].top + LABEL_GAP);
  });

  const unit = chart.asPercent ? '%' : chart.unit;
  const value = (v: number) =>
    chart.asPercent ? formatChange(v, '%', t) : formatValue(v, unit, t);

  return (
    <View className="gap-5">
      <View className="gap-3">
        <GestureDetector gesture={holdGesture((at) => nearestIndex(dayXs, at), picked, setPicked)}>
          <View style={{ height: HEIGHT }} onLayout={onLayout}>
            {width > 0 ? (
              <>
                <Svg width={plotWidth} height={HEIGHT}>
                  <ChartGrid id="coach-compare" width={plotWidth} height={HEIGHT} />
                  {series.map((s) => (
                    <Path
                      key={s.exerciseId}
                      d={linePath(
                        s.points,
                        (p) => x(p.date),
                        (_, k) => y(s.shown[k]),
                      )}
                      stroke={s.colors.line}
                      strokeWidth={2.5}
                      fill="none"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  ))}
                </Svg>
                {held ? <HoldLine x={held.x} height={HEIGHT} /> : null}
                {/* After all lines, so none is drawn over. */}
                {series.map((s, i) => {
                  const point = s.points[shownAt[i]];
                  return (
                    <Ring
                      key={s.exerciseId}
                      x={x(point.date)}
                      y={y(s.shown[shownAt[i]])}
                      color={s.colors.line}
                    />
                  );
                })}
                {labels.map(({ i, top }) => (
                  <View
                    key={series[i].exerciseId}
                    className="absolute"
                    style={{ left: plotWidth + 12, top }}
                  >
                    <ExerciseLabel
                      exerciseId={series[i].exerciseId}
                      value={value(series[i].shown[shownAt[i]])}
                      color={series[i].colors.label}
                    />
                  </View>
                ))}
              </>
            ) : null}
          </View>
        </GestureDetector>
        {held ? (
          <View className="h-[15px]">
            <Text
              numberOfLines={1}
              className="absolute text-center font-inter-semibold text-xs leading-[15px] text-fg"
              style={{
                width: HELD_DATE,
                left: Math.max(0, Math.min(plotWidth - HELD_DATE, held.x - HELD_DATE / 2)),
              }}
            >
              {formatShortDate(fromIsoDate(held.day))}
            </Text>
          </View>
        ) : (
          <TimeAxis
            labels={[monthLabel(fromIsoDate(firstDay)), monthLabel(fromIsoDate(lastDay))]}
          />
        )}
      </View>
      <View>
        {series.map((s, i) => {
          const values = s.points.map((p) => p.value);
          const firstValue = values[0];
          const lastValue = values.at(-1)!;
          return (
            <ExerciseRow
              key={s.exerciseId}
              exerciseId={s.exerciseId}
              color={s.colors.line}
              from={formatAxisValue(firstValue, chart.unit)}
              to={formatValue(lastValue, chart.unit, t)}
              change={formatChange(firstValue ? (lastValue / firstValue - 1) * 100 : 0, '%', t)}
              first={i === 0}
            />
          );
        })}
      </View>
    </View>
  );
}
