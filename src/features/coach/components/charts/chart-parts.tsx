import { useState } from 'react';
import { type LayoutChangeEvent, View, type ViewStyle } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import Svg, { Line } from 'react-native-svg';

import { haptics } from '@/shared/lib/haptics';
import { colors } from '@/shared/lib/theme';
import { Text } from '@/shared/ui/text';

import { dateLabel } from '../../lib/charts';

/** How long a finger rests on a chart to read it: a quicker one scrolls the chat. */
const HOLD_MS = 150;
/** Outer radius of a marked point, with its line. */
const RING = 6.25;

/** A chart's measured width (0 until laid out), for the SVG inside it. */
export function useWidth() {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(Math.round(e.nativeEvent.layout.width));
  return [width, onLayout] as const;
}

/**
 * Hold a finger on a chart and move it to read the data, as on the weight and exercise charts.
 * `indexAt` says what lies under the finger; `onPick` gets null when it lifts.
 */
export function holdGesture(
  indexAt: (x: number, y: number) => number | null,
  picked: number | null,
  onPick: (index: number | null) => void,
) {
  const move = (x: number, y: number) => {
    const next = indexAt(x, y);
    if (next === picked) return;
    if (next !== null) haptics.select();
    onPick(next);
  };
  return Gesture.Pan()
    .runOnJS(true)
    .activateAfterLongPress(HOLD_MS)
    .onStart((e) => move(e.x, e.y))
    .onUpdate((e) => move(e.x, e.y))
    .onFinalize(() => onPick(null));
}

/** A marked point: a view, as any change inside an Svg redraws all of it and a finger moves this. */
export function Ring({ x, y, color = colors.accent }: { x: number; y: number; color?: string }) {
  return (
    <View
      className="absolute rounded-full border-[2.5px] bg-bg"
      style={{
        left: x - RING,
        top: y - RING,
        width: 2 * RING,
        height: 2 * RING,
        borderColor: color,
      }}
    />
  );
}

/** The line down a chart at the point a finger holds. */
export function HoldLine({ x, height }: { x: number; height: number }) {
  return <View className="absolute top-0 w-px bg-track" style={{ left: x, height }} />;
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
