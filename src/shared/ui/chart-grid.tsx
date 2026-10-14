import { Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';

import { colors } from '@/shared/lib/theme';

/** Side of a grid square. */
const CELL = 14;

export interface ChartGridProps {
  /** Unique within the screen: the gradient is looked up by it. */
  id: string;
  width: number;
  height: number;
}

/** Square grid behind a chart's data, fading out towards the sides; goes inside an `Svg`. */
export function ChartGrid({ id, width, height }: ChartGridProps) {
  return (
    <>
      <Defs>
        {/* The grid fades out towards the screen edges; the data doesn't. */}
        <LinearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          x1={12}
          y1={0}
          x2={width - 12}
          y2={0}
        >
          <Stop offset={0} stopColor={colors.chip} stopOpacity={0} />
          <Stop offset={0.18} stopColor={colors.chip} stopOpacity={1} />
          <Stop offset={0.82} stopColor={colors.chip} stopOpacity={1} />
          <Stop offset={1} stopColor={colors.chip} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <G stroke={`url(#${id})`} strokeWidth={1}>
        {Array.from({ length: Math.floor(height / CELL) + 1 }, (_, i) => (
          <Path key={`h${i}`} d={`M12 ${i * CELL + 0.5}H${width - 12}`} />
        ))}
        {Array.from({ length: Math.floor((width - 40) / CELL) + 1 }, (_, i) => (
          <Path key={`v${i}`} d={`M${20 + i * CELL + 0.5} 0V${height}`} />
        ))}
      </G>
    </>
  );
}
