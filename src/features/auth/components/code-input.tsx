import { useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { BlinkingCursor } from '@/shared/ui/input-cell';
import { Text } from '@/shared/ui/text';

export interface CodeInputProps {
  value: string;
  onChange: (code: string) => void;
  length?: number;
  accessibilityLabel: string;
  error?: boolean;
}

/**
 * One box per digit (design PW-B). A hidden field takes the typing, so the keyboard's code
 * suggestion from the email and pasting fill all boxes at once.
 */
export function CodeInput({
  value,
  onChange,
  length = 6,
  accessibilityLabel,
  error,
}: CodeInputProps) {
  const input = useRef<TextInput>(null);
  const [focused, setFocused] = useState(true);
  const current = value.length < length && focused ? value.length : -1;

  return (
    <Pressable accessible={false} onPress={() => input.current?.focus()} className="flex-row gap-2">
      {Array.from({ length }, (_, i) => (
        <View
          key={i}
          className="h-13 min-w-0 flex-1 items-center justify-center rounded-[14px] border border-white/8 bg-pill"
        >
          {i === current || error ? (
            <View
              pointerEvents="none"
              className={cn(
                'absolute -inset-px rounded-[14px] border-2',
                error ? 'border-danger' : 'border-accent',
              )}
            />
          ) : null}
          {value[i] ? (
            <Text variant="headline" className="text-xl">
              {value[i]}
            </Text>
          ) : null}
          {/* The current box is the first empty one. */}
          {i === current ? <BlinkingCursor /> : null}
        </View>
      ))}
      <TextInput
        ref={input}
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, length))}
        accessibilityLabel={accessibilityLabel}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={length}
        autoFocus
        caretHidden
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
      />
    </Pressable>
  );
}
