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

/** A filled pencil: a plan built by hand. */
export function PencilGlyph({ color }: GlyphProps) {
  return (
    <Svg width={17} height={17} viewBox="0 0 16 16">
      <Path
        d="M11.4 1.7a1.7 1.7 0 0 1 2.4 0l.5.5a1.7 1.7 0 0 1 0 2.4L5.6 13.3l-3.9 1 1-3.9z"
        fill={color}
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
