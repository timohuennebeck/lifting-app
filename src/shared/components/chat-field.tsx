import { type ReactNode, type Ref, useEffect, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { cn } from '@/shared/lib/cn';
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
  inputRef?: Ref<TextInput>;
  onFocusChange?: (focused: boolean) => void;
  /** While resting, a tap on the text leads here. */
  onPressResting?: () => void;
  className?: string;
  /** The corners of the box and its ring. */
  radiusClassName?: string;
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
  inputRef,
  onFocusChange,
  onPressResting,
  className,
  radiusClassName = 'rounded-[24px]',
}: ChatFieldProps) {
  const [focused, setFocused] = useState(false);
  // The input is replaced when it starts or stops resting, and a replaced one reports no blur.
  if (resting && focused) setFocused(false);
  useEffect(() => {
    if (resting) onFocusChange?.(false);
  }, [resting, onFocusChange]);
  const setFieldFocused = (next: boolean) => {
    setFocused(next);
    onFocusChange?.(next);
  };

  return (
    <View className={cn('gap-3.5 bg-tile px-2.5 pt-4 pb-2.5', radiusClassName, className)}>
      {focused ? (
        <View
          pointerEvents="none"
          className={cn('absolute inset-0 border-2 border-accent', radiusClassName)}
        />
      ) : null}
      {above}
      <View>
        {/* A new input each way: iOS would keep the height of the text it held before. */}
        <TextInput
          key={resting ? 'resting' : 'typing'}
          ref={inputRef}
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
          onFocus={() => setFieldFocused(true)}
          onBlur={() => setFieldFocused(false)}
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
        {resting && onPressResting ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={placeholder}
            onPress={onPressResting}
            className="absolute inset-0 z-10"
          />
        ) : null}
      </View>
      <View className="flex-row items-center justify-between">
        {leading ?? <View />}
        <CharCount length={value.length} max={maxLength} className="self-center" />
        <View className="flex-row items-center gap-1">{actions}</View>
      </View>
    </View>
  );
}
