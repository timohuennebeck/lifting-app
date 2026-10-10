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

export interface RadioListProps<T extends string> {
  options: RadioListOption<T>[];
  value: T;
  onSelect: (value: T) => void;
}

/** One radio row per option; the selected one has the accent border. */
export function RadioList<T extends string>({ options, value, onSelect }: RadioListProps<T>) {
  return (
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
            onPress={() => onSelect(option.value)}
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
  );
}

export interface RadioListSheetProps<T extends string> extends RadioListProps<T> {
  visible: boolean;
  onClose: () => void;
}

/** Sheet with one radio row per option (language, units); a tap applies it and closes it. */
export function RadioListSheet<T extends string>({
  visible,
  onClose,
  onSelect,
  ...list
}: RadioListSheetProps<T>) {
  return (
    <Sheet visible={visible} onClose={onClose}>
      <RadioList
        {...list}
        onSelect={(value) => {
          onSelect(value);
          onClose();
        }}
      />
    </Sheet>
  );
}
