import { type ReactNode, useState } from 'react';
import { ActivityIndicator, TextInput, View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { CharCount } from '@/shared/ui/char-count';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';

export interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  maxLength: number;
  editable?: boolean;
  /** Inside the box above the text, e.g. the screenshots of a message. */
  top?: ReactNode;
  /** Bottom left, e.g. "+" for a screenshot. */
  accessory?: ReactNode;
  onSend: () => void;
  sendLabel: string;
  canSend: boolean;
  /** Neon send button: there is something to send. */
  ready: boolean;
  sending?: boolean;
  /** While an answer comes in, the button stops it instead of sending. */
  stop?: { label: string; onPress: () => void } | null;
}

/**
 * The box a chat message is written in (support chat 01f-3e, Kai): two lines to start, the
 * characters near the limit, and the send arrow.
 */
export function ChatInput({
  value,
  onChangeText,
  placeholder,
  maxLength,
  editable = true,
  top,
  accessory,
  onSend,
  sendLabel,
  canSend,
  ready,
  sending = false,
  stop,
}: ChatInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View className="px-3 pt-2">
      {/* Like the text fields: a 1pt line, with the 2pt neon ring on top of it while typing. */}
      <View className="gap-3.5 rounded-[24px] border border-white/8 bg-tile px-2.5 pt-4 pb-2.5">
        {focused ? (
          <View
            pointerEvents="none"
            className="absolute -inset-px rounded-[24px] border-2 border-accent"
          />
        ) : null}
        {top}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          multiline
          maxLength={maxLength}
          placeholder={placeholder}
          placeholderTextColor={colors.dim}
          selectionColor={colors.fg}
          cursorColor={colors.fg}
          keyboardAppearance="dark"
          textAlignVertical="top"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          // Two lines tall even when empty, so there's room to start typing.
          className="max-h-30 min-h-11 px-2 py-0 font-inter text-base leading-5.5 text-fg"
        />
        <View className="flex-row items-center justify-between">
          {accessory ?? <View className="size-10" />}
          <CharCount length={value.length} max={maxLength} className="self-center" />
          {stop ? (
            <PressableScale
              haptic="press"
              accessibilityLabel={stop.label}
              onPress={stop.onPress}
              className="size-10 items-center justify-center rounded-full bg-fg"
            >
              <View className="size-3 rounded-[3px] bg-bg" />
            </PressableScale>
          ) : (
            <PressableScale
              haptic="press"
              accessibilityLabel={sendLabel}
              accessibilityState={{ disabled: !canSend, busy: sending }}
              disabled={!canSend}
              onPress={onSend}
              className={cn(
                'size-10 items-center justify-center rounded-full',
                ready ? 'bg-accent' : 'bg-control',
              )}
            >
              {sending ? (
                <ActivityIndicator color={colors.onAccent} />
              ) : (
                <Icon name="arrow-up" size={16} color={ready ? colors.onAccent : colors.dim} />
              )}
            </PressableScale>
          )}
        </View>
      </View>
    </View>
  );
}
