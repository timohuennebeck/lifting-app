import { useId } from 'react';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { linePath } from '@/shared/lib/chart';
import { colors } from '@/shared/lib/theme';

/** The box spans at least this many kg, so a tiny change stays a gentle slope. */
const MIN_SPAN_KG = 0.6;

export interface TrendLineProps {
  /** One value per day, oldest first, in kg. */
  series: number[];
  width: number;
  height: number;
  /** A fill under the line, fading out to the bottom. */
  area?: boolean;
  /** Weigh-ins as small dots: their day's index in `series` and their weight. */
  dots?: { index: number; kg: number }[];
  /** Room above and below the line. */
  pad?: number;
  strokeWidth?: number;
  /** The line's opacity, for a chart behind text. */
  opacity?: number;
  endDot?: boolean;
}

/** The weight trend as a line (with a fill and weigh-in dots if asked), the highest value on top. */
export function TrendLine({
  series,
  width,
  height,
  area = false,
  dots = [],
  pad = 6,
  strokeWidth = 2,
  opacity = 1,
  endDot = true,
}: TrendLineProps) {
  const id = `fill${useId().replace(/\W/g, '')}`;
  if (!width || !series.length) return null;
  const values = [...series, ...dots.map((d) => d.kg)];
  const max = Math.max(...values);
  const span = Math.max(max - Math.min(...values), MIN_SPAN_KG);
  // A flat or narrow span sits in the middle.
  const top = max + (span - (max - Math.min(...values))) / 2;
  const x = (i: number) =>
    series.length > 1 ? 2 + (i / (series.length - 1)) * (width - 4 - (endDot ? 4 : 0)) : width / 2;
  const y = (kg: number) => pad + ((top - kg) / span) * (height - 2 * pad);
  const d = linePath(series, (_, i) => x(i), y);
  const last = series.length - 1;
  return (
    <Svg width={width} height={height} style={{ overflow: 'visible' }}>
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.accent} stopOpacity={0.28 * opacity} />
          <Stop offset="1" stopColor={colors.accent} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      {area ? (
        <Path
          d={`${d} L${x(last).toFixed(1)} ${height} L${x(0).toFixed(1)} ${height} Z`}
          fill={`url(#${id})`}
        />
      ) : null}
      {dots.map((dot) => (
        <Circle
          key={dot.index}
          cx={x(dot.index)}
          cy={y(dot.kg)}
          r={2}
          fill={colors.fgMid}
          opacity={0.55 * opacity}
        />
      ))}
      <Path
        d={d}
        fill="none"
        stroke={colors.accent}
        strokeOpacity={opacity}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {endDot ? (
        <Circle cx={x(last)} cy={y(series[last])} r={3.5} fill={colors.accent} opacity={opacity} />
      ) : null}
    </Svg>
  );
}
