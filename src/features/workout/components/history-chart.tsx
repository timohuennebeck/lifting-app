import { useState } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

import { formatShortDate, formatWeight, type UnitSystem } from '@/shared/lib/format';
import { haptics } from '@/shared/lib/haptics';
import { clamp } from '@/shared/lib/math';
import { colors, useAccentColor } from '@/shared/lib/theme';
import { Text } from '@/shared/ui/text';

import { buildLineChart, type ChartInput, nearestPoint } from '../lib/chart';
import { fromDisplayWeight } from '../lib/weight';

const HEIGHT = 120;
const CHIP_WIDTH = 84;

export interface HistoryChartProps {
  /** Top weight per session in display units, oldest first. */
  data: ChartInput[];
  units: UnitSystem;
}

/** Top weight per session; press and drag to read a session (design 03·C·2H·V5H). */
export function HistoryChart({ data, units }: HistoryChartProps) {
  const { t } = useTranslation('workout');
  const accent = useAccentColor();
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const { points, line, area } = buildLineChart(data, width, HEIGHT);
  const active = hover != null ? points[hover] : undefined;
  const lastPoint = points.at(-1);
  const shown = active ?? lastPoint;
  // Hovering compares with the session before, otherwise with the range start.
  const base = active ? (hover ? points[hover - 1] : undefined) : points[0];
  const delta = shown && base ? shown.value - base.value : 0;
  const weight = (v: number) => formatWeight(fromDisplayWeight(v, units), units);

  const track = (x: number) => {
    if (!points.length) return;
    const index = nearestPoint(points, x);
    if (index !== hover) haptics.select();
    setHover(index);
  };
  const scrub = Gesture.Pan()
    .runOnJS(true)
    .minDistance(0)
    .onBegin((e) => track(e.x))
    .onUpdate((e) => track(e.x))
    .onFinalize(() => setHover(null));

  return (
    <View className="gap-3">
      <View className="gap-1">
        <View className="flex-row items-baseline gap-2">
          <Text className="font-inter-semibold text-[28px] leading-7.5">
            {shown ? weight(shown.value) : '–'}
          </Text>
          {shown && base && points.length > 1 ? (
            <Text variant="label" tone="accent">
              {`${delta >= 0 ? '+' : '−'}${weight(Math.abs(delta))}`}
            </Text>
          ) : null}
        </View>
        <Text variant="caption" tone="subtle" className="font-inter">
          {active ? (
            <>
              <Text variant="caption">{formatShortDate(active.time)}</Text>
              {` · ${t('history.topWeightShort')}`}
            </>
          ) : (
            t('history.topWeight')
          )}
        </Text>
      </View>
      <GestureDetector gesture={scrub}>
        <View
          className="mt-1"
          style={{ height: HEIGHT }}
          onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
          accessibilityLabel={t('history.chartLabel')}
        >
          <View className="absolute inset-0 justify-between">
            {[0, 1, 2].map((k) => (
              <View key={k} className="h-px bg-pill" />
            ))}
          </View>
          {width > 0 && points.length ? (
            <Svg width={width} height={HEIGHT} style={{ overflow: 'visible' }}>
              <Defs>
                <LinearGradient id="history-fill" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={accent} stopOpacity={0.22} />
                  <Stop offset="1" stopColor={accent} stopOpacity={0} />
                </LinearGradient>
              </Defs>
              <Path d={area} fill="url(#history-fill)" />
              <Path
                d={line}
                fill="none"
                stroke={accent}
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {active ? (
                <Path d={`M${active.x} 0 V${HEIGHT}`} stroke={colors.track} strokeWidth={1} />
              ) : null}
              {shown ? (
                <Circle
                  cx={shown.x}
                  cy={shown.y}
                  r={5}
                  fill={colors.bg}
                  stroke={accent}
                  strokeWidth={2.5}
                />
              ) : null}
            </Svg>
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
