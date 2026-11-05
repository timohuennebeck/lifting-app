import { View } from 'react-native';

import { colors } from '@/shared/lib/theme';

export interface RingProps {
  x: number;
  y: number;
  color?: string;
  /** Outer radius, with the ring's line. */
  radius?: number;
  /** Width of the ring's line. */
  border?: number;
}

/**
 * A chart's marked point: a view, as any change inside an Svg redraws all of it and a finger moves
 * this. By default the neon ring of the point shown.
 */
export function Ring({ x, y, color = colors.accent, radius = 6.25, border = 2.5 }: RingProps) {
  return (
    <View
      className="absolute rounded-full bg-bg"
      style={{
        left: x - radius,
        top: y - radius,
        width: 2 * radius,
        height: 2 * radius,
        borderWidth: border,
        borderColor: color,
      }}
    />
  );
}

/** The line down a chart at the point a finger holds. */
export function HoldLine({ x, height }: { x: number; height: number }) {
  return <View className="absolute top-0 w-px bg-track" style={{ left: x, height }} />;
}
