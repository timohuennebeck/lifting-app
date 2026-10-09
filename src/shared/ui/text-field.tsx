import { useBottomSheetInternal } from '@gorhom/bottom-sheet';
import { forwardRef, useState } from 'react';
import { TextInput, type TextInputProps, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';

import { Icon } from './icon';
import { PressableScale } from './pressable-scale';
import { SheetTextInput } from './sheet';
import { Text } from './text';

export interface TextFieldProps extends TextInputProps {
  label?: string;
  /** Shows a round clear button while the field has text. */
  clearable?: boolean;
  /** Adds a show/hide toggle for password fields. */
  revealable?: boolean;
  error?: string;
  /** Smaller form style of the account screens (56pt, 16pt text). */
  compact?: boolean;
  className?: string;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  {
    label,
    clearable,
    revealable,
    error,
    compact,
    className,
    value,
    onChangeText,
    onFocus,
    onBlur,
    secureTextEntry,
    ...props
  },
  ref,
) {
  const { t } = useTranslation();
  // Inside a bottom sheet the input must be Gorhom's so the sheet tracks the keyboard.
  const Input = useBottomSheetInternal(true) ? SheetTextInput : TextInput;
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const hasValue = !!value?.length;

  return (
    <View className={cn('gap-2', className)}>
      {label ? (
        <Text variant="overline" tone="subtle" className="px-1">
          {label}
        </Text>
      ) : null}
      <View
        // Design rings sit inside the padding: 1pt at rest, 2pt accent on focus.
        className={cn(
          'flex-row items-center gap-3',
          compact ? 'h-14 rounded-[18px] bg-pill' : 'h-16 rounded-[22px] bg-surface',
          error || focused
            ? cn('border-2', compact ? 'pr-1.5 pl-4' : 'pr-2 pl-4.5')
            : cn(
                'border',
                compact ? 'border-white/8 pr-1.75 pl-4.25' : 'border-line pr-2.25 pl-4.75',
              ),
          error ? 'border-danger' : focused && 'border-accent',
        )}
      >
        <Input
          ref={ref as never}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={colors.dim}
          selectionColor={colors.fg}
          cursorColor={colors.fg}
          keyboardAppearance="dark"
          secureTextEntry={secureTextEntry && !revealed}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          // Font size only: a line height on a single-line input pushes the text off-centre on iOS.
          textAlignVertical="center"
          className={cn(
            'h-full min-w-0 flex-1 py-0 font-inter text-fg',
            compact ? 'text-[16px]' : 'text-[18px]',
          )}
          {...props}
        />
        {revealable ? (
          <PressableScale
            haptic="select"
            accessibilityLabel={t('actions.togglePassword')}
            onPress={() => setRevealed((r) => !r)}
            className={cn(
              'items-center justify-center rounded-full',
              compact ? 'size-10' : 'size-11',
            )}
          >
            <Icon name="eye" size={18} color={revealed ? colors.fg : colors.muted} />
          </PressableScale>
        ) : null}
        {clearable && hasValue ? (
          <PressableScale
            haptic="select"
            accessibilityLabel={t('actions.clear')}
            onPress={() => onChangeText?.('')}
            className="size-11 items-center justify-center rounded-full bg-control"
          >
            <Icon name="close" size={12} />
          </PressableScale>
        ) : null}
      </View>
      {error ? (
        <Text variant="caption" tone="danger" className="px-1">
          {error}
        </Text>
      ) : null}
    </View>
  );
});
