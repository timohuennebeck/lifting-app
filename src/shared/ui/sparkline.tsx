import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/shared/lib/theme';

const WIDTH = 100;
const HEIGHT = 24;
const DOT = 3;
/** The line's room in the box: from 1pt below the top to clear of the end dot at the bottom. */
const TOP = 1;
const LINE_HEIGHT = HEIGHT - TOP - DOT;
const LINE_WIDTH = WIDTH - 4;

/** The values in the box, the highest at its top. */
function sparkPath(series: number[], minSpan: number) {
  const max = Math.max(...series);
  const span = Math.max(max - Math.min(...series), minSpan);
  const points = series.map((v, i) => ({
    x: (i / Math.max(1, series.length - 1)) * LINE_WIDTH,
    y: TOP + ((max - v) / span) * LINE_HEIGHT,
  }));
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('');
  return { d, end: points[points.length - 1] };
}

export interface SparklineProps {
  /** One value per day, oldest first. */
  series: number[];
  /** The box's height spans at least this much, so a tiny change stays a gentle slope. */
  minSpan: number;
}

/** A trend's daily values as a small accent line ending in a dot (Veränderung · Trend). */
export function Sparkline({ series, minSpan }: SparklineProps) {
  const { d, end } = sparkPath(series, minSpan);
  return (
    <Svg width={WIDTH} height={HEIGHT} style={{ overflow: 'visible' }}>
      <Path
        d={d}
        fill="none"
        stroke={colors.accent}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <Circle cx={end.x} cy={end.y} r={DOT} fill={colors.accent} />
    </Svg>
  );
}
