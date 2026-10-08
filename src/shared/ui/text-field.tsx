import { forwardRef, useState } from 'react';
import { TextInput, type TextInputProps, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';

import { Icon } from './icon';
import { PressableScale } from './pressable-scale';
import { Text } from './text';

export interface TextFieldProps extends TextInputProps {
  label?: string;
  /** Shows a round clear button while the field has text. */
  clearable?: boolean;
  /** Adds a show/hide toggle for password fields. */
  revealable?: boolean;
  error?: string;
  className?: string;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  {
    label,
    clearable,
    revealable,
    error,
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
        className={cn(
          'h-16 flex-row items-center gap-3 rounded-[22px] border-2 bg-surface pr-2.5 pl-5',
          error ? 'border-danger' : focused ? 'border-accent' : 'border-transparent',
        )}
      >
        <TextInput
          ref={ref}
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
          className="h-full min-w-0 flex-1 font-inter text-lg text-fg"
          {...props}
        />
        {revealable ? (
          <PressableScale
            haptic="select"
            accessibilityLabel={t('actions.togglePassword')}
            onPress={() => setRevealed((r) => !r)}
            className="size-11 items-center justify-center rounded-full"
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
