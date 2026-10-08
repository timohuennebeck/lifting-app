import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';

export interface RadioDotProps {
  selected: boolean;
  /** Ring color while selected; defaults to the accent. */
  color?: string;
}

/** 24pt radio indicator: thick ring when selected, hairline track otherwise. */
export function RadioDot({ selected, color }: RadioDotProps) {
  return (
    <View
      className={cn(
        'size-6 rounded-full',
        selected ? 'border-[7px] border-accent' : 'border-[1.5px] border-track',
      )}
      style={selected && color ? { borderColor: color } : undefined}
    />
  );
}
