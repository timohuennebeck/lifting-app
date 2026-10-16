import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { type UnitSystem, weightUnit } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';

import { formatChange } from '../lib/format';
import type { TrendChange } from '../lib/trend';

const SPARK_WIDTH = 100;
const SPARK_HEIGHT = 24;
const DOT = 3;
/** The line's room in the box: from 1pt below the top to clear of the end dot at the bottom. */
const TOP = 1;
const LINE_HEIGHT = SPARK_HEIGHT - TOP - DOT;
const LINE_WIDTH = SPARK_WIDTH - 4;
/** The box's height spans at least this many kg, so a tiny change stays a gentle slope. */
const MIN_SPAN_KG = 0.3;

/** The trend's daily values in the box, the highest at its top. */
function sparkPath(series: number[]) {
  const max = Math.max(...series);
  const span = Math.max(max - Math.min(...series), MIN_SPAN_KG);
  const points = series.map((v, i) => ({
    x: (i / Math.max(1, series.length - 1)) * LINE_WIDTH,
    y: TOP + ((max - v) / span) * LINE_HEIGHT,
  }));
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('');
  return { d, end: points[points.length - 1] };
}

export interface TrendChangeRowProps {
  change: TrendChange;
  units: UnitSystem;
}

/** "7 Tage", the trend's sparkline and how much it moved (GW·2, Veränderung · Trend). */
export function TrendChangeRow({ change, units }: TrendChangeRowProps) {
  const { t } = useTranslation('weight');
  const { d, end } = sparkPath(change.series);
  const value = formatChange(change.changeKg, units);
  const unit = weightUnit(units);
  // Neutral: whether down is good depends on the user's goal.
  const direction = value.startsWith('−')
    ? 'trend-down'
    : value.startsWith('+')
      ? 'trend-up'
      : null;
  return (
    <View className="h-14.5 flex-row items-center px-5">
      <Text variant="label" className="flex-1">
        {t('history.days', { count: change.days })}
      </Text>
      <Svg width={SPARK_WIDTH} height={SPARK_HEIGHT} style={{ overflow: 'visible' }}>
        <Path
          d={d}
          fill="none"
          stroke={colors.accent}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <Circle cx={end.x} cy={end.y} r={DOT} fill={colors.accent} />
      </Svg>
      {/* Sits 3pt above the row's middle, as in the design. */}
      <View className="mb-1.5 w-25 items-end">
        <Text variant="label" className="leading-5 tabular-nums">
          {`${value} ${unit}`}
        </Text>
        <View className="mt-1.25 h-2">
          {direction ? <Icon name={direction} size={14} color={colors.muted} /> : null}
        </View>
      </View>
    </View>
  );
}
