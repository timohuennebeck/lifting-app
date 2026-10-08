import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';
import { PressableScale, type PressableScaleProps } from '@/shared/ui/pressable-scale';
import { Text, type TextTone } from '@/shared/ui/text';

export interface TextButtonProps extends Omit<PressableScaleProps, 'children'> {
  label: ReactNode;
  tone?: TextTone;
  textClassName?: string;
}

/** Borderless secondary action below a CTA ("Later", "Create a plan for me"). */
export function TextButton({
  label,
  tone = 'default',
  className,
  textClassName,
  haptic = 'tap',
  ...props
}: TextButtonProps) {
  return (
    <PressableScale
      haptic={haptic}
      hitSlop={4}
      className={cn('min-h-12 items-center justify-center px-4', className)}
      {...props}
    >
      <Text variant="label" tone={tone} className={cn('text-center', textClassName)}>
        {label}
      </Text>
    </PressableScale>
  );
}
