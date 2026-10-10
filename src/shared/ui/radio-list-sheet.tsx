import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';

import { PressableScale } from './pressable-scale';
import { RadioDot } from './radio-dot';
import { Sheet } from './sheet';
import { Text } from './text';

export interface RadioListOption<T extends string> {
  value: T;
  label: string;
  /** E.g. a flag. */
  leading?: ReactNode;
}

export interface RadioListSheetProps<T extends string> {
  visible: boolean;
  onClose: () => void;
  options: RadioListOption<T>[];
  value: T;
  /** A tap picks the option and closes the sheet. */
  onSelect: (value: T) => void;
}

/** Sheet with one radio row per option (the app language); a tap applies it. */
export function RadioListSheet<T extends string>({
  visible,
  onClose,
  options,
  value,
  onSelect,
}: RadioListSheetProps<T>) {
  return (
    <Sheet visible={visible} onClose={onClose}>
      <View className="gap-2">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <PressableScale
              key={option.value}
              activeScale={1}
              haptic="select"
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => {
                onSelect(option.value);
                onClose();
              }}
              className={cn(
                'h-16 flex-row items-center gap-3.5 rounded-[22px] border-2 bg-elevated px-4',
                selected ? 'border-accent' : 'border-transparent',
              )}
            >
              {option.leading}
              <Text variant="bodyStrong" className="flex-1">
                {option.label}
              </Text>
              <RadioDot selected={selected} />
            </PressableScale>
          );
        })}
      </View>
    </Sheet>
  );
}
