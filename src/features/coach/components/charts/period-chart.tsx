import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Svg from 'react-native-svg';

import { cn } from '@/shared/lib/cn';
import { addDays, DAY_MS, fromIsoDate, startOfWeek } from '@/shared/lib/date';
import { ChartGrid } from '@/shared/ui/chart-grid';
import { Text } from '@/shared/ui/text';

import { formatChange, formatValue, type PeriodChart as PeriodChartData } from '../../lib/charts';
import { DashedLine, Headline, monthLabel, useWidth } from './chart-parts';

/** The chart, its tallest bar (the current one's value sits above that) and a bar's width. */
const HEIGHT = 150;
const BARS = 144;
const BAR_WIDTH = 18;
/** The grid reaches this far past the bars, at the sides and the top. */
const GRID_X = 4;
const GRID_Y = 8;

/** ISO week number of a Monday (YYYY-MM-DD): counted from the week with the year's 4 January. */
function isoWeek(day: string) {
  const thursday = addDays(fromIsoDate(day), 3);
  const first = addDays(startOfWeek(new Date(thursday.getFullYear(), 0, 4)), 3);
  return 1 + Math.round((thursday.getTime() - first.getTime()) / (7 * DAY_MS));
}

/**
 * This week or month against the ones before (design CO3·3 "Zeitraum vs. Schnitt"): a bar per
 * period, the current one neon with its value, and the average as a dashed line.
 */
export function PeriodChart({ chart }: { chart: PeriodChartData }) {
  const { t } = useTranslation('coach');
  const [width, onLayout] = useWidth();
  const current = chart.bars.at(-1);
  if (!current) return null;
  const top = Math.max(1, chart.average ?? 0, ...chart.bars.map((b) => b.value));
  const height = (value: number) => (value / top) * BARS;
  const step = chart.bars.length > 1 ? (width - BAR_WIDTH) / (chart.bars.length - 1) : 0;
  const change =
    chart.average != null && chart.average > 0
      ? formatChange(((current.value - chart.average) / chart.average) * 100, '%', t)
      : null;
  const label = (day: string) =>
    chart.period === 'week'
      ? t('period.week', { week: isoWeek(day) })
      : monthLabel(fromIsoDate(day));
  const middle = chart.bars[Math.floor((chart.bars.length - 1) / 2)];
  const averageTop = chart.average != null ? HEIGHT - height(chart.average) : null;

  return (
    <View className="gap-3">
      <Headline
        value={formatValue(current.value, chart.unit, t)}
        change={change}
        caption={t(`period.caption.${chart.period}`, {
          metric: t(`topics.${chart.metric}`),
          count: chart.bars.length - 1,
        })}
      />
      <View className="mt-[22px] gap-3">
        <View style={{ height: HEIGHT }} onLayout={onLayout}>
          {width > 0 ? (
            <>
              <Svg
                className="absolute"
                style={{ left: -GRID_X, top: -GRID_Y }}
                width={width + 2 * GRID_X}
                height={HEIGHT + GRID_Y}
              >
                <ChartGrid id="coach-period" width={width + 2 * GRID_X} height={HEIGHT + GRID_Y} />
              </Svg>
              {chart.bars.map((bar, i) => (
                <View
                  key={bar.date}
                  className={cn(
                    'absolute bottom-0 rounded-md',
                    i === chart.bars.length - 1 ? 'bg-accent' : 'bg-track',
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
                className="absolute right-0 font-inter-bold text-xs leading-[15px] text-accent"
                style={{ top: HEIGHT - height(current.value) - 22 }}
              >
                {formatValue(current.value, chart.unit, t)}
              </Text>
            </>
          ) : null}
        </View>
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
