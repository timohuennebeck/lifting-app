import type { ReactNode } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';

import { Icon } from './icon';
import { Text, type TextTone, type TextVariant } from './text';

export interface CheckBadgeProps {
  /** Diameter in pt. */
  size: number;
  /** Size of the check glyph in pt. */
  glyph: number;
  style?: StyleProp<ViewStyle>;
}

/** Accent circle with a check: done, selected or included. */
export function CheckBadge({ size, glyph, style }: CheckBadgeProps) {
  return (
    <View
      className="items-center justify-center rounded-full bg-accent"
      style={[{ width: size, height: size }, style]}
    >
      <Icon name="check" size={glyph} color={colors.onAccent} />
    </View>
  );
}

const SIZES = {
  md: { size: 26, glyph: 12 },
  sm: { size: 24, glyph: 14 },
} as const;

export interface CheckItemProps {
  /** Row text; nest a second Text for a lighter tail. */
  children: ReactNode;
  /** md: 26pt badge with a 12pt check; sm: 24pt badge with a 14pt check. */
  size?: keyof typeof SIZES;
  variant?: TextVariant;
  tone?: TextTone;
  className?: string;
  textClassName?: string;
}

/** List row with an accent check in front (benefits, tips, promises). */
export function CheckItem({
  children,
  size = 'md',
  variant = 'label',
  tone,
  className,
  textClassName,
}: CheckItemProps) {
  return (
    <View className={cn('flex-row items-center gap-3', className)}>
      <CheckBadge {...SIZES[size]} />
      <Text variant={variant} tone={tone} className={cn('flex-1', textClassName)}>
        {children}
      </Text>
    </View>
  );
}
