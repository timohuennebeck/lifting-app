import { useState } from 'react';
import { type LayoutChangeEvent, View, type ViewStyle } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { colors } from '@/shared/lib/theme';
import { Text } from '@/shared/ui/text';

import { dateLabel } from '../../lib/charts';

/** A chart's measured width (0 until laid out), for the SVG inside it. */
export function useWidth() {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(Math.round(e.nativeEvent.layout.width));
  return [width, onLayout] as const;
}

export interface HeadlineProps {
  value: string;
  change?: string | null;
  caption: string;
}

/** "79,6 kg −4,6 kg" over "Trend heute · seit Mai": the number the chart is about. */
export function Headline({ value, change, caption }: HeadlineProps) {
  return (
    <View className="gap-1">
      <View className="flex-row items-baseline gap-2">
        <Text className="font-inter-semibold text-[28px] leading-7 text-fg">{value}</Text>
        {change ? (
          <Text className="font-inter-semibold text-label leading-[19px] text-accent">
            {change}
          </Text>
        ) : null}
      </View>
      <Text className="font-inter text-caption leading-4 text-subtle">{caption}</Text>
    </View>
  );
}

/** "Mai", "Okt": month names as the design writes them. */
export const monthLabel = (date: Date) => dateLabel(date, { month: 'short' });

/** A row of labels under a chart, spread from edge to edge (`inset` keeps clear on the right). */
export function TimeAxis({ labels, inset = 0 }: { labels: string[]; inset?: number }) {
  return (
    <View className="flex-row justify-between" style={{ paddingRight: inset }}>
      {labels.map((label, i) => (
        <Text key={i} className="font-inter-semibold text-xs leading-[15px] text-dim">
          {label}
        </Text>
      ))}
    </View>
  );
}

export interface DashedLineProps {
  /** How long the line is: across, or down when `vertical`. */
  length: number;
  vertical?: boolean;
  /** Where it sits in the chart. */
  style: ViewStyle;
}

/** The dashed guideline of an average or a reference value. */
export function DashedLine({ length, vertical = false, style }: DashedLineProps) {
  return (
    <Svg
      className="absolute"
      style={style}
      width={vertical ? 2 : length}
      height={vertical ? length : 2}
    >
      <Line
        x1={vertical ? 0.75 : 0}
        y1={vertical ? 0 : 0.75}
        x2={vertical ? 0.75 : length}
        y2={vertical ? length : 0.75}
        stroke={colors.subtle}
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
    </Svg>
  );
}
