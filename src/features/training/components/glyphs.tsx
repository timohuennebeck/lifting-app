import { Text as RNText, View } from 'react-native';

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

/** "Aa" rename mark. */
export function RenameGlyph({ color }: GlyphProps) {
  return (
    <RNText className="font-inter-semibold" style={{ color, fontSize: 15 }}>
      Aa
    </RNText>
  );
}
