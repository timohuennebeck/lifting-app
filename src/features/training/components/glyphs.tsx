import { Text as RNText, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors } from '@/shared/lib/theme';

interface GlyphProps {
  color: string;
}

/** Three text lines: a routine. */
export function RoutineGlyph({ color }: GlyphProps) {
  return (
    <View className="gap-0.75">
      {[16, 16, 10].map((w, i) => (
        <View
          key={i}
          className="h-[2.5px] rounded-xs"
          style={{ width: w, backgroundColor: color }}
        />
      ))}
    </View>
  );
}

/** 2×2 grid with one open cell: a plan. */
export function PlanGlyph({ color }: GlyphProps) {
  return (
    <View className="w-3.75 flex-row flex-wrap gap-0.75">
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          className="size-1.5 rounded-xs"
          style={i === 3 ? { borderWidth: 1.5, borderColor: color } : { backgroundColor: color }}
        />
      ))}
    </View>
  );
}

/**
 * A pencil (pencil-simple): a plan built by hand. An outline; filled when its option is selected,
 * the line by the tip then cut out in the accent behind it.
 */
export function PencilGlyph({ color, filled }: GlyphProps & { filled?: boolean }) {
  return (
    <Svg width={17} height={17} viewBox="0 0 256 256">
      <Path
        d="M92.7 216H48a8 8 0 0 1-8-8v-44.7a8 8 0 0 1 2.3-5.6L165.7 34.3a8 8 0 0 1 11.3 0L221.7 79a8 8 0 0 1 0 11.3L98.3 213.7a8 8 0 0 1-5.6 2.3z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={24}
        strokeLinejoin="round"
      />
      <Path
        d="M136 64l56 56"
        stroke={filled ? colors.accent : color}
        strokeWidth={filled ? 16 : 24}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** "Aa" rename mark. */
export function RenameGlyph({ color }: GlyphProps) {
  return (
    <RNText className="font-inter-semibold" style={{ color, fontSize: 15 }}>
      Aa
    </RNText>
  );
}
