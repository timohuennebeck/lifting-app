import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { BlinkingCursor } from '@/shared/ui/blinking-cursor';
import { Text } from '@/shared/ui/text';

export const CODE_LENGTH = 6;

export interface CodeInputProps {
  value: string;
  onChange: (code: string) => void;
  editable?: boolean;
}

/**
 * The code a change brings: what was typed, or a whole code pasted or filled in at once (iOS
 * may hand the suggestion over twice), which then replaces the boxes. No maxLength on the field:
 * iOS drops an autofill that would go past it.
 */
function nextCode(current: string, text: string) {
  const digits = text.replace(/\D/g, '');
  const inserted = digits.length - current.length >= CODE_LENGTH;
  return inserted ? digits.slice(-CODE_LENGTH) : digits.slice(0, CODE_LENGTH);
}

/**
 * The 6-digit code as six boxes. The field that takes the typing lies invisibly over them, so a
 * tap focuses it, a long press offers iOS's Paste, and the system's one-time-code suggestion
 * ("From Mail") fills them at once. The next box to fill shows a blinking caret in accent.
 */
export function CodeInput({ value, onChange, editable = true }: CodeInputProps) {
  const [focused, setFocused] = useState(true);
  const next = Math.min(value.length, CODE_LENGTH - 1);

  return (
    <View>
      <View className="flex-row gap-2" pointerEvents="none">
        {Array.from({ length: CODE_LENGTH }, (_, i) => {
          const active = focused && i === next && value.length < CODE_LENGTH;
          return (
            <View
              key={i}
              className={cn(
                'h-14.5 flex-1 items-center justify-center rounded-[14px] border bg-pill',
                active ? 'border-2 border-accent' : 'border-white/8',
              )}
            >
              {value[i] ? (
                <Text className="font-inter-semibold text-[22px] text-fg">{value[i]}</Text>
              ) : active ? (
                // Keyed by the length, so it shows steadily again after each digit, as iOS does.
                <BlinkingCursor key={value.length} className="h-6" />
              ) : null}
            </View>
          );
        })}
      </View>
      <TextInput
        value={value}
        onChangeText={(text) => onChange(nextCode(value, text))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        autoFocus
        editable={editable}
        caretHidden
        selectionColor="transparent"
        keyboardAppearance="dark"
        // Over the boxes and see-through (not opacity 0, which iOS doesn't let take touches).
        className="absolute inset-0"
        style={{ color: 'transparent' }}
      />
    </View>
  );
}
