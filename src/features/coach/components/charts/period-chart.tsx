import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Svg from 'react-native-svg';

import { useWidth } from '@/shared/hooks/use-width';
import { nearestIndex } from '@/shared/lib/chart';
import { cn } from '@/shared/lib/cn';
import { addDays, DAY_MS, fromIsoDate, startOfWeek } from '@/shared/lib/date';
import { ChartGrid } from '@/shared/ui/chart-grid';
import { Text } from '@/shared/ui/text';

import { formatChange, formatValue, type PeriodChart as PeriodChartData } from '../../lib/charts';
import { DashedLine, Headline, holdGesture, monthLabel } from './chart-parts';

/** The chart, its tallest bar (the current one's value sits above that) and a bar's width. */
const HEIGHT = 150;
const BARS = 144;
const BAR_WIDTH = 18;
/** The grid reaches this far past the bars, at the sides and the top. */
const GRID_X = 4;
const GRID_Y = 8;
/** The value above the bar shown. */
const VALUE_WIDTH = 96;

/** ISO week number of a Monday (YYYY-MM-DD): counted from the week with the year's 4 January. */
function isoWeek(day: string) {
  const thursday = addDays(fromIsoDate(day), 3);
  const first = addDays(startOfWeek(new Date(thursday.getFullYear(), 0, 4)), 3);
  return 1 + Math.round((thursday.getTime() - first.getTime()) / (7 * DAY_MS));
}

/**
 * This week or month against the ones before (design CO3·3 "Zeitraum vs. Schnitt"): a bar per
 * period, the current one, or the one a finger holds, neon with its value, and the average as a
 * dashed line.
 */
export function PeriodChart({ chart }: { chart: PeriodChartData }) {
  const { t } = useTranslation('coach');
  const [width, onLayout] = useWidth();
  const [picked, setPicked] = useState<number | null>(null);
  const current = chart.bars.at(-1);
  if (!current) return null;
  const shownIndex = picked ?? chart.bars.length - 1;
  const shown = chart.bars[shownIndex];
  const top = Math.max(1, chart.average ?? 0, ...chart.bars.map((b) => b.value));
  const height = (value: number) => (value / top) * BARS;
  const step = chart.bars.length > 1 ? (width - BAR_WIDTH) / (chart.bars.length - 1) : 0;
  const change =
    chart.average != null && chart.average > 0
      ? formatChange(((shown.value - chart.average) / chart.average) * 100, '%', t)
      : null;
  const label = (day: string) =>
    chart.period === 'week'
      ? t('period.week', { week: isoWeek(day) })
      : monthLabel(fromIsoDate(day));
  const middle = chart.bars[Math.floor((chart.bars.length - 1) / 2)];
  const averageTop = chart.average != null ? HEIGHT - height(chart.average) : null;
  const centers = chart.bars.map((_, i) => i * step + BAR_WIDTH / 2);
  // Centred above its bar, or against the edge it would cross.
  const valueLeft = centers[shownIndex] - VALUE_WIDTH / 2;
  const maxLeft = width - VALUE_WIDTH;

  return (
    <View className="gap-3">
      <Headline
        value={formatValue(shown.value, chart.unit, t)}
        change={change}
        caption={
          picked === null
            ? t(`period.caption.${chart.period}`, {
                metric: t(`topics.${chart.metric}`),
                count: chart.bars.length - 1,
              })
            : `${t(`topics.${chart.metric}`)} · ${label(shown.date)}`
        }
      />
      <View className="mt-[22px] gap-3">
        <GestureDetector
          gesture={holdGesture((at) => nearestIndex(centers, at), picked, setPicked)}
        >
          <View style={{ height: HEIGHT }} onLayout={onLayout}>
            {width > 0 ? (
              <>
                <Svg
                  className="absolute"
                  style={{ left: -GRID_X, top: -GRID_Y }}
                  width={width + 2 * GRID_X}
                  height={HEIGHT + GRID_Y}
                >
                  <ChartGrid
                    id="coach-period"
                    width={width + 2 * GRID_X}
                    height={HEIGHT + GRID_Y}
                  />
                </Svg>
                {chart.bars.map((bar, i) => (
                  <View
                    key={bar.date}
                    className={cn(
                      'absolute bottom-0 rounded-md',
                      i === shownIndex ? 'bg-accent' : 'bg-track',
                    )}
                    style={{ left: i * step, width: BAR_WIDTH, height: height(bar.value) }}
                  />
                ))}
                {averageTop != null ? (
                  <>
                    <DashedLine length={width} style={{ left: 0, top: averageTop }} />
                    <Text
                      className="absolute left-0 bg-bg pr-1 font-inter-semibold text-[11px] leading-[14px] text-fg-2"
                      style={{ top: averageTop - 20 }}
                    >
                      {t('period.average', { value: formatValue(chart.average!, chart.unit, t) })}
                    </Text>
                  </>
                ) : null}
                <Text
                  numberOfLines={1}
                  className={cn(
                    'absolute font-inter-bold text-xs leading-[15px] text-accent',
                    valueLeft <= 0 && 'text-left',
                    valueLeft >= maxLeft && 'text-right',
                    valueLeft > 0 && valueLeft < maxLeft && 'text-center',
                  )}
                  style={{
                    left: Math.max(0, Math.min(maxLeft, valueLeft)),
                    width: VALUE_WIDTH,
                    top: HEIGHT - height(shown.value) - 22,
                  }}
                >
                  {formatValue(shown.value, chart.unit, t)}
                </Text>
              </>
            ) : null}
          </View>
        </GestureDetector>
        <View className="flex-row justify-between">
          {[chart.bars[0], middle, current].map((bar, i) => (
            <Text key={i} className="font-inter-semibold text-[11px] leading-[14px] text-dim">
              {label(bar.date)}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}
