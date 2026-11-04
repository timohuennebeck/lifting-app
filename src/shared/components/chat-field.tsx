import { type ReactNode, useState } from 'react';
import { TextInput, View } from 'react-native';

import { colors } from '@/shared/lib/theme';
import { CharCount } from '@/shared/ui/char-count';
import { Text } from '@/shared/ui/text';

export interface ChatFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  maxLength: number;
  placeholder: string;
  /** No typing for now, e.g. while the answer comes in; the placeholder says why. */
  resting?: boolean;
  /** Over the text, e.g. the screenshots going along. */
  above?: ReactNode;
  /** Left of the button row. */
  leading?: ReactNode;
  /** Right of the button row: the microphone, send, stop. */
  actions: ReactNode;
}

/**
 * The box of a chat (support, Kai): the text over the whole width, one line at first and growing
 * with it, above a row of buttons. While typing it has the 2pt neon ring of the text fields.
 */
export function ChatField({
  value,
  onChangeText,
  maxLength,
  placeholder,
  resting = false,
  above,
  leading,
  actions,
}: ChatFieldProps) {
  const [focused, setFocused] = useState(false);
  // The input is replaced when it starts or stops resting, and a replaced one reports no blur.
  if (resting && focused) setFocused(false);
  return (
    <View className="gap-3.5 rounded-[24px] bg-tile px-2.5 pt-4 pb-2.5">
      {focused ? (
        <View
          pointerEvents="none"
          className="absolute inset-0 rounded-[24px] border-2 border-accent"
        />
      ) : null}
      {above}
      <View>
        {/* A new input each way: iOS would keep the height of the text it held before. */}
        <TextInput
          key={resting ? 'resting' : 'typing'}
          accessibilityLabel={placeholder}
          value={value}
          onChangeText={onChangeText}
          editable={!resting}
          multiline
          maxLength={maxLength}
          selectionColor={colors.fg}
          cursorColor={colors.fg}
          keyboardAppearance="dark"
          textAlignVertical="top"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="max-h-30 min-h-5.5 px-2 py-0 font-inter text-base leading-5.5 text-fg"
        />
        {value.trim() ? null : (
          // Our own on the first line: iOS drops its placeholder once the field holds empty lines.
          <Text
            pointerEvents="none"
            importantForAccessibility="no-hide-descendants"
            numberOfLines={1}
            className="absolute inset-x-2 top-px font-inter text-base leading-5.5 text-dim"
          >
            {placeholder}
          </Text>
        )}
      </View>
      <View className="flex-row items-center justify-between">
        {leading ?? <View />}
        <CharCount length={value.length} max={maxLength} className="self-center" />
        <View className="flex-row items-center gap-1">{actions}</View>
      </View>
    </View>
  );
}
