import { createContext, forwardRef, useContext, useState } from 'react';
import { TextInput, type TextInputProps, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';

import { Icon, type IconName } from './icon';
import { PressableScale } from './pressable-scale';
import { Text } from './text';

/** Field shape of an area: rounded corners in onboarding, a pill once signed in. */
export type TextFieldShape = 'rounded' | 'pill';
const ShapeContext = createContext<TextFieldShape>('rounded');
/** Sets the shape of every TextField below it (the signed-in app uses 'pill'). */
export const TextFieldShapeProvider = ShapeContext.Provider;

export interface TextFieldProps extends TextInputProps {
  label?: string;
  /** Shows a round clear button while the field has text. */
  clearable?: boolean;
  /** Adds a show/hide toggle for password fields. */
  revealable?: boolean;
  error?: string;
  /** Leading icon, e.g. `search`. */
  icon?: IconName;
  className?: string;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  {
    label,
    clearable,
    revealable,
    error,
    icon,
    className,
    value,
    onChangeText,
    onFocus,
    onBlur,
    secureTextEntry,
    multiline,
    ...props
  },
  ref,
) {
  const { t } = useTranslation();
  const shape = useContext(ShapeContext);
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
        // One field style app-wide: 56pt, 16pt text. Rings sit inside the padding (1pt at rest,
        // 2pt accent on focus), so the text never shifts.
        className={cn(
          'flex-row gap-3 bg-pill',
          shape === 'pill' ? (multiline ? 'rounded-[28px]' : 'rounded-full') : 'rounded-[18px]',
          multiline ? 'min-h-32 items-start' : 'h-14 items-center',
          error || focused ? 'border-2 pr-1.5 pl-4' : 'border border-white/8 pr-1.75 pl-4.25',
          error ? 'border-danger' : focused && 'border-accent',
        )}
      >
        {icon ? <Icon name={icon} size={16} color={colors.dim} /> : null}
        <TextInput
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
          multiline={multiline}
          // Font size only: a line height on a single-line input pushes the text off-centre on iOS.
          textAlignVertical={multiline ? 'top' : 'center'}
          className={cn(
            'min-w-0 flex-1 font-inter text-[16px] text-fg',
            multiline ? 'min-h-32 py-3.5 leading-5.5' : 'h-full py-0',
          )}
          {...props}
        />
        {revealable ? (
          <PressableScale
            haptic="select"
            accessibilityLabel={t('actions.togglePassword')}
            onPress={() => setRevealed((r) => !r)}
            className="size-10 items-center justify-center rounded-full"
          >
            <Icon name="eye" size={18} color={revealed ? colors.fg : colors.muted} />
          </PressableScale>
        ) : null}
        {clearable && hasValue ? (
          <PressableScale
            haptic="select"
            accessibilityLabel={t('actions.clear')}
            onPress={() => onChangeText?.('')}
            className="size-10 items-center justify-center rounded-full bg-control"
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
