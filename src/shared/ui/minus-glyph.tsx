import { View } from 'react-native';

export interface MinusGlyphProps {
  color: string;
  width?: number;
}

/** Short bar used for delete / remove. */
export function MinusGlyph({ color, width = 16 }: MinusGlyphProps) {
  return <View className="h-[2.5px] rounded-xs" style={{ width, backgroundColor: color }} />;
}
