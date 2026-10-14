import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';

import { PressableScale } from './pressable-scale';
import { Text } from './text';

export interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string | number> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Shown but not pressable, e.g. while what a change depends on is loading. */
  disabled?: boolean;
  className?: string;
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  disabled,
  className,
}: SegmentedControlProps<T>) {
  return (
    <View
      className={cn('flex-row rounded-full bg-elevated p-1', disabled && 'opacity-50', className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <PressableScale
            key={option.value}
            haptic="select"
            accessibilityRole="tab"
            accessibilityState={{ selected: active, disabled: !!disabled }}
            disabled={disabled}
            onPress={() => onChange(option.value)}
            className={cn(
              'h-9 flex-1 items-center justify-center rounded-full px-3',
              active && 'bg-white/12',
            )}
          >
            <Text variant="caption" tone={active ? 'default' : 'subtle'}>
              {option.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}
