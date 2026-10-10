import { createContext, type Ref, useContext, useRef, useState } from 'react';
import { Pressable, TextInput, type TextInputProps, View } from 'react-native';
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
  ref?: Ref<TextInput>;
}

export function TextField({
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
  ref,
  ...props
}: TextFieldProps) {
  const { t } = useTranslation();
  const shape = useContext(ShapeContext);
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const input = useRef<TextInput | null>(null);
  const setInput = (node: TextInput | null) => {
    input.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };
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
        // One field style app-wide: 56pt, 16pt text. The 1pt line never changes; the 2pt focus or
        // error ring is drawn on top of it, so neither the field nor its text can shift.
        // A tap anywhere on the field focuses it, not only on the text line.
        accessible={false}
        onPress={() => input.current?.focus()}
        className={cn(
          'flex-row gap-3 border border-white/8 bg-pill pr-1.75 pl-4.25',
          radius,
          multiline ? 'min-h-32 items-start' : 'h-14 items-center',
        )}
      >
        {error || focused ? (
          <View
            pointerEvents="none"
            className={cn(
              'absolute -inset-px border-2',
              radius,
              error ? 'border-danger' : 'border-accent',
            )}
          />
        ) : null}
        {icon ? <Icon name={icon} size={16} color={colors.dim} /> : null}
        <TextInput
          ref={setInput}
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
          // A single line is only as tall as its text and the row centres it: filling the field's
          // height, the text sat low on iOS once focused.
          textAlignVertical={multiline ? 'top' : 'center'}
          className={cn(
            'min-w-0 flex-1 font-inter text-[16px] text-fg',
            multiline ? 'min-h-32 py-3.5 leading-5.5' : 'py-0',
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
      </Pressable>
      {error ? (
        <Text variant="caption" tone="danger" className="px-1">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
