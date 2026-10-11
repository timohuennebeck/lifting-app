import { View } from 'react-native';

import { colors } from '@/shared/lib/theme';

export interface MinusGlyphProps {
  color: string;
  width?: number;
}

/** Short bar used for delete / remove. */
export function MinusGlyph({ color, width = 16 }: MinusGlyphProps) {
  return <View className="h-[2.5px] rounded-xs" style={{ width, backgroundColor: color }} />;
}

/** `renderIcon` of a ChoiceSheet's delete option: the minus, dark on the red once selected. */
export const deleteIcon = (active: boolean) => (
  <MinusGlyph color={active ? colors.bg : colors.fg} />
);
