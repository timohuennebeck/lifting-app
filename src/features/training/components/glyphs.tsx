import { Text as RNText, View } from 'react-native';

import { colors } from '@/shared/lib/theme';

interface GlyphProps {
  color?: string;
}

/** Stacked cards: collections (01·V header and create sheet). */
export function CollectionsGlyph({ color = colors.fg }: GlyphProps) {
  return (
    <View className="items-center gap-0.5">
      <View className="h-0.5 w-2.5 rounded-[1px]" style={{ backgroundColor: color }} />
      <View className="h-0.5 w-[13px] rounded-[1px]" style={{ backgroundColor: color }} />
      <View className="h-[9px] w-4 rounded-[3px] border-2" style={{ borderColor: color }} />
    </View>
  );
}

/** Three text lines: a template. */
export function TemplateGlyph({ color = colors.fg }: GlyphProps) {
  return (
    <View className="gap-[3px]">
      {[16, 16, 10].map((w, i) => (
        <View
          key={i}
          className="h-[2.5px] rounded-[2px]"
          style={{ width: w, backgroundColor: color }}
        />
      ))}
    </View>
  );
}

/** 2×2 grid with one open cell: a program. */
export function ProgramGlyph({ color = colors.fg }: GlyphProps) {
  return (
    <View className="w-[15px] flex-row flex-wrap gap-[3px]">
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          className="size-1.5 rounded-[2px]"
          style={i === 3 ? { borderWidth: 1.5, borderColor: color } : { backgroundColor: color }}
        />
      ))}
    </View>
  );
}

/** Short bar used for delete / remove. */
export function MinusGlyph({ color = colors.bg, width = 16 }: GlyphProps & { width?: number }) {
  return <View className="h-[2.5px] rounded-[2px]" style={{ width, backgroundColor: color }} />;
}

/** "Aa" rename mark. */
export function RenameGlyph({ color = colors.fg, size = 15 }: GlyphProps & { size?: number }) {
  return (
    <RNText className="font-inter-semibold" style={{ color, fontSize: size }}>
      Aa
    </RNText>
  );
}
