import { type StyleProp, View, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, useAccentColor } from '@/shared/lib/theme';

import { CheckBadge } from './check-item';
import { Text } from './text';

export interface DashedRingProps {
  color: string;
  style?: StyleProp<ViewStyle>;
}

/** 38pt dashed ring marking a planned training; positioned absolutely by the caller. */
export function DashedRing({ color, style }: DashedRingProps) {
  return (
    <Svg
      width={38}
      height={38}
      viewBox="0 0 38 38"
      style={[{ position: 'absolute', transform: [{ rotate: '-90deg' }] }, style]}
    >
      <Circle
        cx={19}
        cy={19}
        r={17.5}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray="13.3 5"
      />
    </Svg>
  );
}

export interface PlanSlotProps {
  number: number;
  done: boolean;
  /** The slot being shown: only it gets the accent ring. */
  selected?: boolean;
  /** Amber dot: something in this slot still needs a check (plan import). */
  review?: boolean;
}

/** Plan strip slot: accent check when done, otherwise the slot number in a dashed ring. */
export function PlanSlot({ number, done, selected, review }: PlanSlotProps) {
  const accent = useAccentColor();
  return (
    <View className="size-8 items-center justify-center">
      {done ? (
        <CheckBadge
          size={32}
          glyph={14}
          style={
            selected ? { boxShadow: `0 0 0 3px ${colors.bg}, 0 0 0 4.5px ${accent}` } : undefined
          }
        />
      ) : (
        <>
          <DashedRing color={selected ? accent : '#4A4A48'} style={{ left: -3, top: -3 }} />
          <Text variant="label" className="text-sm">
            {number}
          </Text>
        </>
      )}
      {review ? (
        <View
          className="absolute -top-1 -right-1 size-2.5 rounded-full border-2 border-bg"
          style={{ backgroundColor: colors.review }}
        />
      ) : null}
    </View>
  );
}

/** Size of the "+" at the end of a plan strip: the slots' outer ring. */
export const PLAN_ADD_SIZE = 38;
