import { Text as RNText, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

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

/** An outline pencil (pencil-simple): a plan built by hand. */
export function PencilGlyph({ color }: GlyphProps) {
  return (
    <Svg width={17} height={17} viewBox="0 0 256 256">
      <Path
        d="M92.7 216H48a8 8 0 0 1-8-8v-44.7a8 8 0 0 1 2.3-5.6L165.7 34.3a8 8 0 0 1 11.3 0L221.7 79a8 8 0 0 1 0 11.3L98.3 213.7a8 8 0 0 1-5.6 2.3zM136 64l56 56"
        stroke={color}
        strokeWidth={24}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
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
