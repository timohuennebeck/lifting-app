import { useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { Text } from '@/shared/ui/text';

export const CODE_LENGTH = 6;

export interface CodeInputProps {
  value: string;
  onChange: (code: string) => void;
  editable?: boolean;
}

/**
 * The 6-digit code as six boxes; one hidden field takes the typing, so pasting and the system's
 * one-time-code suggestion fill it at once. The next box to fill shows the caret in accent.
 */
export function CodeInput({ value, onChange, editable = true }: CodeInputProps) {
  const input = useRef<TextInput>(null);
  const [focused, setFocused] = useState(true);
  const next = Math.min(value.length, CODE_LENGTH - 1);

  return (
    <Pressable accessible={false} onPress={() => input.current?.focus()}>
      <View className="flex-row gap-2">
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
                <View className="h-6 w-0.5 rounded-full bg-accent" />
              ) : null}
            </View>
          );
        })}
      </View>
      <TextInput
        ref={input}
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, CODE_LENGTH))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        autoFocus
        editable={editable}
        maxLength={CODE_LENGTH}
        caretHidden
        keyboardAppearance="dark"
        // Off screen: the boxes show what it holds.
        className="absolute h-px w-px opacity-0"
      />
    </Pressable>
  );
}
