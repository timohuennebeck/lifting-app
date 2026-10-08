import { type StyleProp, View, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, useAccentColor } from '@/shared/lib/theme';

import { Icon } from './icon';
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
  /** Accent ring for the next training to do. */
  next?: boolean;
}

/** Plan strip slot: accent check when done, otherwise the slot number in a dashed ring. */
export function PlanSlot({ number, done, next }: PlanSlotProps) {
  const accent = useAccentColor();
  if (done) {
    return (
      <View
        className="size-8 items-center justify-center rounded-full bg-accent"
        style={{ boxShadow: `0 0 0 3px ${colors.bg}, 0 0 0 4.5px ${accent}80` }}
      >
        <Icon name="check" size={14} color={colors.onAccent} />
      </View>
    );
  }
  return (
    <View className="size-8 items-center justify-center">
      <DashedRing color={next ? accent : '#4A4A48'} style={{ left: -3, top: -3 }} />
      <Text variant="label" className="text-sm">
        {number}
      </Text>
    </View>
  );
}
