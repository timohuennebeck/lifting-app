import { View, type ViewProps } from 'react-native';

import { cn } from '@/shared/lib/cn';

export interface CardProps extends ViewProps {
  className?: string;
}

/** Elevated surface with the design's hairline ring. */
export function Card({ className, ...props }: CardProps) {
  return (
    <View
      className={cn('rounded-[28px] border border-white/8 bg-surface p-5', className)}
      {...props}
    />
  );
}
