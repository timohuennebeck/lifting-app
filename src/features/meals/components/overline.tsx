import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';
import { Text, type TextTone } from '@/shared/ui/text';

export interface OverlineProps {
  children: ReactNode;
  tone?: TextTone;
  className?: string;
}

/** Section and value labels as on the weight history: 12pt caps, set 1pt lower in their box. */
export function Overline({ children, tone = 'subtle', className }: OverlineProps) {
  return (
    <Text
      variant="overline"
      tone={tone}
      numberOfLines={1}
      className={cn('relative top-px text-xs leading-4 tracking-[1.65px]', className)}
    >
      {children}
    </Text>
  );
}
