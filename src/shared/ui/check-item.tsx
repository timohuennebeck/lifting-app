import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';

import { Icon } from './icon';
import { Text, type TextTone, type TextVariant } from './text';

export interface CheckBadgeProps {
  /** Diameter in pt. */
  size: number;
  /** Size of the check glyph in pt. */
  glyph: number;
  className?: string;
}

/** Accent circle with a check: done, selected or included. */
export function CheckBadge({ size, glyph, className }: CheckBadgeProps) {
  return (
    <View
      className={cn('items-center justify-center rounded-full bg-accent', className)}
      style={{ width: size, height: size }}
    >
      <Icon name="check" size={glyph} color={colors.onAccent} />
    </View>
  );
}

const SIZES = {
  md: { size: 26, glyph: 12 },
  sm: { size: 24, glyph: 14 },
} as const;

/** A short point as a pill: the accent check and a few words (onboarding 00, 08·0A). */
export function CheckChip({ label }: { label: string }) {
  return (
    <View className="h-8.5 flex-row items-center gap-2 rounded-full bg-elevated pr-3.5 pl-1.5">
      <CheckBadge size={22} glyph={10} />
      <Text variant="caption">{label}</Text>
    </View>
  );
}

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
