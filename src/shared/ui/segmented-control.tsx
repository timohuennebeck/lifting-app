import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';

import { PressableScale } from './pressable-scale';
import { Text } from './text';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <View className={cn('flex-row rounded-full bg-elevated p-1', className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <PressableScale
            key={option.value}
            haptic="select"
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
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
