import { useState } from 'react';
import { View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Svg, { Line, Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

import { useWidth } from '@/shared/hooks/use-width';
import { buildLineChart, chartBounds, type ChartInput, nearestIndex } from '@/shared/lib/chart';
import { formatShortDate } from '@/shared/lib/format';
import { clamp } from '@/shared/lib/math';
import { scrubGesture } from '@/shared/lib/scrub-gesture';
import { colors } from '@/shared/lib/theme';
import { AreaLine } from '@/shared/ui/area-line';
import { ChartGrid } from '@/shared/ui/chart-grid';
import { Ring } from '@/shared/ui/chart-marks';
import { Text } from '@/shared/ui/text';

/** Nine grid squares. */
const HEIGHT = 126;
const CHIP_WIDTH = 84;
/** The estimated 1RM's dashes. */
const DASH = '5 5';

interface LegendChipProps {
  dashed?: boolean;
  label: string;
  value: string;
}

/** A line's sample (neon, or dashed white), its name and the shown session's value. */
function LegendChip({ dashed, label, value }: LegendChipProps) {
  return (
    <View className="flex-row items-center gap-2 rounded-full bg-chip py-1.5 pr-3 pl-2.5">
      {dashed ? (
        <Svg width={14} height={2}>
          <Line
            x1={0}
            y1={1}
            x2={14}
            y2={1}
            stroke={colors.fg}
            strokeWidth={2}
            strokeDasharray="4 3"
          />
        </Svg>
      ) : (
        <View className="h-0.75 w-3.5 rounded-full bg-accent" />
      )}
      <Text variant="caption" tone="subtle" className="font-inter">
        {label} <Text variant="caption">{value}</Text>
      </Text>
    </View>
  );
}

export type HistoryMetric = 'topWeight' | 'leastAssistance' | 'topReps' | 'topSeconds';

export interface HistoryChartProps {
  /** Best value per session (weight in display units, reps or seconds), oldest first. */
  data: ChartInput[];
  metric: HistoryMetric;
  /** Formats a value or a difference, e.g. "82,5 kg", "12 reps" or "45 s". */
  format: (value: number) => string;
  /**
   * Best estimated one-rep max per session, in the same unit as `data`: a dashed white line on
   * the same scale, with a legend of both lines. Left out where a 1RM doesn't apply.
   */
  oneRepMax?: ChartInput[];
}

/**
 * Best set per session, and with `oneRepMax` the estimated 1RM above it; press and drag to read a
 * session (design 03·C·2H·V5H).
 */
export function HistoryChart({ data, metric, format, oneRepMax }: HistoryChartProps) {
  const { t } = useTranslation('exercises');
  const [width, onLayout] = useWidth();
  const [hover, setHover] = useState<number | null>(null);
  const bounds = chartBounds(data, oneRepMax ?? []);
  const { points, line, area } = buildLineChart(data, width, HEIGHT, bounds);
  const estimate = buildLineChart(oneRepMax ?? [], width, HEIGHT, bounds);
  const active = hover != null ? points[hover] : undefined;
  const lastPoint = points.at(-1);
  const shown = active ?? lastPoint;
  // Hovering compares with the session before, otherwise with the range start.
  const base = active ? (hover ? points[hover - 1] : undefined) : points[0];
  const delta = shown && base ? shown.value - base.value : 0;
  const shownEstimate = shown ? estimate.points.find((p) => p.time === shown.time) : undefined;

  const xs = points.map((p) => p.x);
  const scrub = scrubGesture({
    indexAt: (x) => (xs.length ? nearestIndex(xs, x) : null),
    picked: hover,
    onPick: setHover,
  });

  return (
    <View className="gap-3">
      <View className="gap-1">
        <View className="flex-row items-baseline gap-2">
          <Text className="font-inter-semibold text-[28px] leading-7.5">
            {shown ? format(shown.value) : '–'}
          </Text>
          {shown && base && points.length > 1 ? (
            <Text variant="label" tone="accent">
              {`${delta >= 0 ? '+' : '−'}${format(Math.abs(delta))}`}
            </Text>
          ) : null}
        </View>
        <Text variant="caption" tone="subtle" className="font-inter">
          {active ? (
            <>
              <Text variant="caption">{formatShortDate(active.time)}</Text>
              {` · ${t(`history.${metric}Short`)}`}
            </>
          ) : (
            t(`history.${metric}`)
          )}
        </Text>
        {oneRepMax ? (
          <View className="mt-2 flex-row gap-2">
            <LegendChip label={t('history.weight')} value={shown ? format(shown.value) : '–'} />
            <LegendChip
              dashed
              label={t('history.oneRepMax')}
              value={shownEstimate ? format(Math.round(shownEstimate.value)) : '–'}
            />
          </View>
        ) : null}
      </View>
      <GestureDetector gesture={scrub}>
        <View
          className="mt-1"
          style={{ height: HEIGHT }}
          onLayout={onLayout}
          accessibilityLabel={t('history.chartLabel')}
        >
          {width > 0 ? (
            <Svg width={width} height={HEIGHT} style={{ overflow: 'visible' }}>
              <ChartGrid id="history-grid" width={width} height={HEIGHT} />
              {points.length ? (
                <>
                  <AreaLine id="history-fill" line={line} area={area} />
                  {estimate.points.length ? (
                    <Path
                      d={estimate.line}
                      fill="none"
                      stroke={colors.fg}
                      strokeOpacity={0.85}
                      strokeWidth={2}
                      strokeDasharray={DASH}
                      strokeLinejoin="round"
                    />
                  ) : null}
                </>
              ) : null}
              {active ? (
                <Path d={`M${active.x} 0 V${HEIGHT}`} stroke={colors.track} strokeWidth={1} />
              ) : null}
            </Svg>
          ) : null}
          {shown ? <Ring x={shown.x} y={shown.y} /> : null}
          {shownEstimate ? (
            <Ring
              x={shownEstimate.x}
              y={shownEstimate.y}
              color={colors.fg}
              radius={5.5}
              border={2}
            />
          ) : null}
        </View>
      </GestureDetector>
      <View className="h-5 flex-row items-center justify-between">
        {active ? (
          <View
            className="absolute h-5 items-center justify-center rounded-full bg-elevated"
            style={{
              width: CHIP_WIDTH,
              left: clamp(active.x - CHIP_WIDTH / 2, 0, width - CHIP_WIDTH),
            }}
          >
            <Text className="font-inter-semibold text-[11px] leading-3.5">
              {formatShortDate(active.time)}
            </Text>
          </View>
        ) : (
          <>
            <Text className="font-inter-semibold text-[11px] leading-3.5 text-dim">
              {points[0] ? formatShortDate(points[0].time) : ''}
            </Text>
            <Text className="font-inter-semibold text-[11px] leading-3.5 text-dim">
              {lastPoint ? formatShortDate(lastPoint.time) : ''}
            </Text>
          </>
        )}
      </View>
      {!points.length ? (
        <Text variant="caption" tone="subtle" className="font-inter">
          {t('history.emptyRange')}
        </Text>
      ) : null}
    </View>
  );
}
