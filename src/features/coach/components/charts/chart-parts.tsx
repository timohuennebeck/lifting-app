import { useState } from 'react';
import { type LayoutChangeEvent, View } from 'react-native';

import { addDays, daysBetween, fromIsoDate } from '@/shared/lib/date';
import { formatDate } from '@/shared/lib/format';
import { Text } from '@/shared/ui/text';

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

/** "Mai", "Okt": month names without the abbreviation dot, as the design writes them. */
export const monthLabel = (date: Date) => formatDate(date, { month: 'short' }).replace('.', '');

/**
 * `count` labels spread evenly from the first to the last day: month names for half a year,
 * "9. Okt" for shorter spans.
 */
export function timeLabels(first: string, last: string, count: number) {
  const span = Math.max(1, daysBetween(first, last));
  return Array.from({ length: count }, (_, i) => {
    const date = addDays(fromIsoDate(first), Math.round((span * i) / (count - 1)));
    return span >= 60
      ? monthLabel(date)
      : formatDate(date, { day: 'numeric', month: 'short' }).replace(/\.$/, '');
  });
}

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
