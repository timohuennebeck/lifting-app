import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { ExerciseThumb } from '@/features/exercises/components/exercise-thumb';
import { useExerciseName } from '@/shared/data/exercises';
import { cn } from '@/shared/lib/cn';
import { daysBetween, fromIsoDate } from '@/shared/lib/date';
import { colors } from '@/shared/lib/theme';
import { ChartGrid } from '@/shared/ui/chart-grid';
import { Text } from '@/shared/ui/text';

import {
  type CompareChart as CompareChartData,
  formatAxisValue,
  formatChange,
  formatValue,
  linePath,
  yScale,
} from '../../lib/charts';
import { monthLabel, TimeAxis, useWidth } from './chart-parts';

const HEIGHT = 170;
/** Right of the lines: each line's last value and name. */
const LABELS = 70;
const PAD = 12;
/** Labels closer than this push apart. */
const LABEL_GAP = 30;
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
 * value, then a row per exercise from first to last value.
 */
export function CompareChart({ chart }: { chart: CompareChartData }) {
  const { t } = useTranslation('coach');
  const [width, onLayout] = useWidth();
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

  // Each line's end label, moved apart where they would overlap.
  const labels = series
    .map((s, i) => ({ i, top: y(s.shown.at(-1)!) - 14 }))
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
                {/* The end markers after all lines, so none is drawn over. */}
                {series.map((s) => (
                  <Circle
                    key={`end${s.exerciseId}`}
                    cx={x(s.points.at(-1)!.date)}
                    cy={y(s.shown.at(-1)!)}
                    r={4.5}
                    fill={colors.bg}
                    stroke={s.colors.line}
                    strokeWidth={2.5}
                  />
                ))}
              </Svg>
              {labels.map(({ i, top }) => (
                <View
                  key={series[i].exerciseId}
                  className="absolute"
                  style={{ left: plotWidth + 12, top }}
                >
                  <ExerciseLabel
                    exerciseId={series[i].exerciseId}
                    value={value(series[i].shown.at(-1)!)}
                    color={series[i].colors.label}
                  />
                </View>
              ))}
            </>
          ) : null}
        </View>
        <TimeAxis labels={[monthLabel(fromIsoDate(firstDay)), monthLabel(fromIsoDate(lastDay))]} />
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
