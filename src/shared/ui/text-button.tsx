import { TouchableOpacity, type TouchableOpacityProps, View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { haptics } from '@/shared/lib/haptics';

import type { HapticKind } from './pressable-scale';
import { Text, type TextTone } from './text';

export interface TextButtonProps extends Omit<TouchableOpacityProps, 'children'> {
  label: string;
  /** Plain, non-pressable text before the link ("Already have an account? ·"). */
  prefix?: string;
  tone?: TextTone;
  haptic?: HapticKind;
  className?: string;
  textClassName?: string;
}

/** Borderless text action with opacity feedback ("Later", "Sign in"). */
export function TextButton({
  label,
  prefix,
  tone = 'default',
  haptic = 'tap',
  className,
  textClassName,
  onPress,
  ...props
}: TextButtonProps) {
  const link = (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.5}
      hitSlop={8}
      onPress={(e) => {
        if (haptic !== 'none') haptics[haptic]();
        onPress?.(e);
      }}
      className={cn(!prefix && 'min-h-12 items-center justify-center px-4', !prefix && className)}
      {...props}
    >
      <Text variant="label" tone={tone} className={cn('text-center', textClassName)}>
        {label}
      </Text>
    </TouchableOpacity>
  );
  if (!prefix) return link;
  return (
    <View className={cn('min-h-12 flex-row items-center justify-center px-4', className)}>
      <Text variant="label" tone="muted" className="font-inter">
        {prefix}
      </Text>
      {link}
    </View>
  );
}
