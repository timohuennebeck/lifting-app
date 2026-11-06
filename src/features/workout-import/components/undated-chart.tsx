import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { formatDate } from '@/shared/lib/format';
import { Text } from '@/shared/ui/text';

import type { MonthBar } from '../lib/month-bars';

const HATCH_INK = '#8C8C87';
const HATCH_GROUND = '#3A3A36';
const CHART_HEIGHT = 210;
/** Between a month's two parts. */
const PART_GAP = 3;

/**
 * Stripes like the design's `repeating-linear-gradient(135deg, ink 0 2px, ground 2px period)`:
 * bands from bottom left to top right, as one path (an SVG pattern renders unreliably on iOS).
 */
function Hatch({ period }: { period: number }) {
  const d = Array.from({ length: 80 }, (_, k) => {
    const from = k * period * Math.SQRT2;
    const to = from + 2 * Math.SQRT2;
    return `M${from + 300} -300L${to + 300} -300L${to - 300} 300L${from - 300} 300Z`;
  }).join('');
  return (
    <Svg width="100%" height="100%" style={{ backgroundColor: HATCH_GROUND }}>
      <Path d={d} fill={HATCH_INK} />
    </Svg>
  );
}

/** 18a: per month, the workouts with a date (accent) under those given one (hatched). */
export function UndatedChart({
  bars,
  dated,
  spread,
}: {
  bars: MonthBar[];
  dated: number;
  spread: number;
}) {
  const { t } = useTranslation('workoutImport');
  const most = Math.max(1, ...bars.map((b) => b.dated + b.spread));
  // The busiest month at about nine tenths of the height, as in the design.
  const scale = (0.9 * CHART_HEIGHT - PART_GAP) / most;
  return (
    <View className="gap-3.5 px-1 pt-5 pb-4">
      <View className="flex-row gap-4">
        <View className="flex-row items-center gap-1.75">
          <View className="size-2.5 rounded-[3px] bg-accent" />
          <Text className="font-inter-medium text-[13px] text-muted">
            {t('dates.dated', { count: dated })}
          </Text>
        </View>
        <View className="flex-row items-center gap-1.75">
          <View className="size-2.5 overflow-hidden rounded-[3px]">
            <Hatch period={4} />
          </View>
          <Text className="font-inter-medium text-[13px] text-muted">
            {t('dates.spread', { count: spread })}
          </Text>
        </View>
      </View>
      <View className="flex-row items-end gap-2.5" style={{ height: CHART_HEIGHT }}>
        {bars.map((bar) => (
          <View key={bar.month.getTime()} className="flex-1 gap-0.75">
            {bar.spread ? (
              <View
                className="overflow-hidden rounded-md"
                style={{ height: Math.max(4, bar.spread * scale) }}
              >
                <Hatch period={6} />
              </View>
            ) : null}
            {bar.dated ? (
              <View
                className="rounded-md bg-accent"
                style={{ height: Math.max(4, bar.dated * scale) }}
              />
            ) : null}
          </View>
        ))}
      </View>
      <View className="flex-row gap-2.5">
        {bars.map((bar) => (
          <Text
            key={bar.month.getTime()}
            numberOfLines={1}
            className="flex-1 text-center font-inter-semibold text-xs text-subtle"
          >
            {formatDate(bar.month, { month: 'short' })}
          </Text>
        ))}
      </View>
    </View>
  );
}
