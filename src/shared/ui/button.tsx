import { ActivityIndicator, View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';

import { Icon, type IconName } from './icon';
import { PressableScale, type PressableScaleProps } from './pressable-scale';
import { Text } from './text';

const VARIANTS = {
  primary: { box: 'bg-accent', text: 'onAccent', icon: colors.onAccent },
  secondary: { box: 'bg-control', text: 'default', icon: colors.fg },
  outline: { box: 'border border-line bg-transparent', text: 'default', icon: colors.fg },
  ghost: { box: 'bg-transparent', text: 'subtle', icon: colors.subtle },
  danger: { box: 'bg-danger-bg', text: 'danger', icon: colors.danger },
} as const;

const SIZES = {
  lg: { box: 'h-15 px-6', text: 'label' },
  md: { box: 'h-12 px-5', text: 'caption' },
  sm: { box: 'h-10 px-4', text: 'caption' },
} as const;

export interface ButtonProps extends Omit<PressableScaleProps, 'children'> {
  label: string;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  icon?: IconName;
  loading?: boolean;
}

export function Button({
  label,
  variant = 'primary',
  size = 'lg',
  icon,
  loading,
  disabled,
  className,
  haptic = 'press',
  ...props
}: ButtonProps) {
  const v = VARIANTS[variant];
  const s = SIZES[size];
  const inactive = disabled || loading;
  return (
    <PressableScale
      haptic={haptic}
      disabled={inactive}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      className={cn(
        'flex-row items-center justify-center gap-2 rounded-full',
        v.box,
        s.box,
        disabled && 'opacity-35',
        className,
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={v.icon} />
      ) : (
        <>
          {icon ? (
            <View>
              <Icon name={icon} size={12} color={v.icon} />
            </View>
          ) : null}
          <Text variant={s.text} tone={v.text}>
            {label}
          </Text>
        </>
      )}
    </PressableScale>
  );
}
