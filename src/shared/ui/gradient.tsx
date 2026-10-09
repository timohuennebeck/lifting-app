import { useId } from 'react';
import {
  type DimensionValue,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { colors } from '@/shared/lib/theme';

type Edge = 'top' | 'bottom' | 'left' | 'right';

/** `[offset, opacity]`: offset 0 lies on the `from` edge, 1 on the opposite one. */
export type GradientStop = readonly [offset: number, opacity: number];

// x1, y1, x2, y2 of the gradient vector per starting edge.
const VECTORS = {
  top: [0, 0, 0, 1],
  bottom: [0, 1, 0, 0],
  left: [0, 0, 1, 0],
  right: [1, 0, 0, 0],
} as const;

export interface GradientProps {
  /** Edge the first stop sits on. */
  from: Edge;
  /** Defaults to a fade from `opacity` at `from` to transparent. */
  stops?: readonly GradientStop[];
  opacity?: number;
  color?: string;
  /** Pins a band of this thickness to `from`; without it the gradient fills its parent. */
  size?: DimensionValue;
  /** Own absolute box instead of the default one. */
  style?: StyleProp<ViewStyle>;
}

function bandBox(from: Edge, size: DimensionValue): ViewStyle {
  return from === 'top' || from === 'bottom'
    ? { left: 0, right: 0, [from]: 0, height: size }
    : { top: 0, bottom: 0, [from]: 0, width: size };
}

/** Single-colour linear fade overlay (scrims, edge fades, shades); ignores touches. */
export function Gradient({
  from,
  opacity = 1,
  stops = [
    [0, opacity],
    [1, 0],
  ],
  color = colors.bg,
  size,
  style,
}: GradientProps) {
  // SVG url() references choke on the punctuation React puts into ids.
  const id = `gradient${useId().replace(/[^\w-]/g, '')}`;
  const [x1, y1, x2, y2] = VECTORS[from];
  const box = style ?? (size === undefined ? StyleSheet.absoluteFill : bandBox(from, size));
  return (
    <View pointerEvents="none" style={[{ position: 'absolute' }, box]}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2}>
            {stops.map(([offset, stopOpacity], i) => (
              <Stop key={i} offset={offset} stopColor={color} stopOpacity={stopOpacity} />
            ))}
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
