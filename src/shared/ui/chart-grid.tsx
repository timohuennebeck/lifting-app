import { Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';

import { colors } from '@/shared/lib/theme';

/** Side of a grid square. */
const CELL = 14;
/** Where the grid starts and ends horizontally. */
const INSET = 12;
/** Share of the grid's width over which it fades in at either side. */
const SIDE_FADE = 0.18;
/** How far down the grid fades in from the top. */
const TOP_FADE = 3 * CELL;

/** 0 at an edge, rising to 1 `over` away from it. */
const ramp = (distance: number, over: number) => Math.min(1, Math.max(0, distance / over));

export interface ChartGridProps {
  /** Unique within the screen: the gradients are looked up by it. */
  id: string;
  width: number;
  height: number;
}

/**
 * Square grid behind a chart's data, fading out towards the sides and the top; goes inside an
 * `Svg`. Each line fades along itself with a gradient and across by its opacity.
 */
export function ChartGrid({ id, width, height }: ChartGridProps) {
  const span = width - 2 * INSET;
  return (
    <>
      <Defs>
        <LinearGradient
          id={`${id}-x`}
          gradientUnits="userSpaceOnUse"
          x1={INSET}
          y1={0}
          x2={width - INSET}
          y2={0}
        >
          <Stop offset={0} stopColor={colors.chip} stopOpacity={0} />
          <Stop offset={SIDE_FADE} stopColor={colors.chip} stopOpacity={1} />
          <Stop offset={1 - SIDE_FADE} stopColor={colors.chip} stopOpacity={1} />
          <Stop offset={1} stopColor={colors.chip} stopOpacity={0} />
        </LinearGradient>
        <LinearGradient
          id={`${id}-y`}
          gradientUnits="userSpaceOnUse"
          x1={0}
          y1={0}
          x2={0}
          y2={height}
        >
          <Stop offset={0} stopColor={colors.chip} stopOpacity={0} />
          <Stop offset={TOP_FADE / height} stopColor={colors.chip} stopOpacity={1} />
          <Stop offset={1} stopColor={colors.chip} stopOpacity={1} />
        </LinearGradient>
      </Defs>
      <G stroke={`url(#${id}-x)`} strokeWidth={1}>
        {Array.from({ length: Math.floor(height / CELL) + 1 }, (_, i) => {
          const y = i * CELL + 0.5;
          return (
            <Path
              key={`h${i}`}
              d={`M${INSET} ${y}H${width - INSET}`}
              strokeOpacity={ramp(y, TOP_FADE)}
            />
          );
        })}
      </G>
      <G stroke={`url(#${id}-y)`} strokeWidth={1}>
        {Array.from({ length: Math.floor((width - 40) / CELL) + 1 }, (_, i) => {
          const x = 20 + i * CELL + 0.5;
          return (
            <Path
              key={`v${i}`}
              d={`M${x} 0V${height}`}
              strokeOpacity={ramp(Math.min(x - INSET, width - INSET - x), SIDE_FADE * span)}
            />
          );
        })}
      </G>
    </>
  );
}
