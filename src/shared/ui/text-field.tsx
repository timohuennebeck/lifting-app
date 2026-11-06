import { type ReactNode, useRef, useState } from 'react';
import { Pressable, TextInput, type TextInputProps, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';

import { CharCount } from './char-count';
import { Icon, type IconName } from './icon';
import { PressableScale } from './pressable-scale';
import { Text } from './text';

export interface TextFieldProps extends TextInputProps {
  label?: string;
  /** Shows a round clear button while the field has text. */
  clearable?: boolean;
  /** Leading icon, e.g. `search`. */
  icon?: IconName;
  /** A pill for search fields; every other field has rounded corners. */
  shape?: 'rounded' | 'pill';
  /** 48pt instead of 56pt, e.g. the search bar, as tall as the button beside it. */
  compact?: boolean;
  /** At the field's end, e.g. a password's show/hide button. */
  trailing?: ReactNode;
  className?: string;
}

export function TextField({
  label,
  clearable,
  icon,
  shape = 'rounded',
  compact,
  trailing,
  className,
  value,
  onChangeText,
  onFocus,
  onBlur,
  multiline,
  maxLength,
  ...props
}: TextFieldProps) {
  const { t } = useTranslation();
  const [focused, setFocused] = useState(false);
  const input = useRef<TextInput>(null);
  const hasValue = !!value?.length;
  // Multi-line fields only round their corners: a pill that tall looks like a capsule.
  const radius = shape === 'pill' && !multiline ? 'rounded-full' : 'rounded-[18px]';

  return (
    <View className={cn('gap-2', className)}>
      {label ? (
        <Text variant="overline" tone="subtle" className="px-1">
          {label}
        </Text>
      ) : null}
      <Pressable
        // One field style app-wide: 56pt (48pt compact), 16pt text. The 1pt line never changes;
        // the 2pt focus ring is drawn on top of it, so neither the field nor its text can shift.
        // A tap anywhere on the field focuses it, not only on the text line.
        accessible={false}
        onPress={() => input.current?.focus()}
        className={cn(
          'flex-row gap-3 border border-white/8 bg-pill pr-1.75 pl-4.25',
          radius,
          multiline ? 'min-h-32 items-start' : cn('items-center', compact ? 'h-12' : 'h-14'),
        )}
      >
        {focused ? (
          <View
            pointerEvents="none"
            className={cn('absolute -inset-px border-2 border-accent', radius)}
          />
        ) : null}
        {icon ? <Icon name={icon} size={16} color={colors.dim} /> : null}
        <TextInput
          ref={input}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={colors.dim}
          selectionColor={colors.fg}
          cursorColor={colors.fg}
          keyboardAppearance="dark"
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          multiline={multiline}
          maxLength={maxLength}
          // Font size only: a line height on a single-line input pushes the text off-centre on iOS.
          // A single line is only as tall as its text and the row centres it: filling the field's
          // height, the text sat low on iOS once focused.
          textAlignVertical={multiline ? 'top' : 'center'}
          className={cn(
            'min-w-0 flex-1 font-inter text-[16px] text-fg',
            multiline ? 'min-h-32 py-3.5 leading-5.5' : 'py-0',
          )}
          {...props}
        />
        {clearable && hasValue ? (
          <PressableScale
            haptic="select"
            accessibilityLabel={t('actions.clear')}
            onPress={() => onChangeText?.('')}
            className={cn(
              'items-center justify-center rounded-full bg-control',
              compact ? 'size-9' : 'size-10',
            )}
          >
            <Icon name="close" size={12} />
          </PressableScale>
        ) : null}
        {trailing}
      </Pressable>
      {maxLength ? <CharCount length={value?.length ?? 0} max={maxLength} /> : null}
    </View>
  );
}
