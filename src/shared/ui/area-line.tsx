import { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { colors } from '@/shared/lib/theme';

export interface AreaLineProps {
  /** Unique within the Svg: the fill's gradient is looked up by it. */
  id: string;
  /** The line's path and the area under it, as buildLineChart makes them. */
  line: string;
  area: string;
}

/** A value over time as the exercise charts draw it: a neon line, the neon fading out under it. */
export function AreaLine({ id, line, area }: AreaLineProps) {
  return (
    <>
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.accent} stopOpacity={0.22} />
          <Stop offset="1" stopColor={colors.accent} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d={area} fill={`url(#${id})`} />
      <Path
        d={line}
        fill="none"
        stroke={colors.accent}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </>
  );
}
