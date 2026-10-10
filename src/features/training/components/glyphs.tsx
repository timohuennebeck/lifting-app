import { Text as RNText, View } from 'react-native';

interface GlyphProps {
  color: string;
}

/** Stacked cards: collections (create sheet). */
export function CollectionsGlyph({ color }: GlyphProps) {
  return (
    <View className="items-center gap-0.5">
      <View className="h-0.5 w-2.5 rounded-[1px]" style={{ backgroundColor: color }} />
      <View className="h-0.5 w-3.25 rounded-[1px]" style={{ backgroundColor: color }} />
      <View className="h-2.25 w-4 rounded-[3px] border-2" style={{ borderColor: color }} />
    </View>
  );
}

/** Three text lines: a template. */
export function TemplateGlyph({ color }: GlyphProps) {
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

/** 2×2 grid with one open cell: a program. */
export function ProgramGlyph({ color }: GlyphProps) {
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
