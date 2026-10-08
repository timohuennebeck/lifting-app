import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';

import { PressableScale } from './pressable-scale';
import { Text } from './text';

export interface OptionCardProps {
  title: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  /** Number badge on the left; pass a node for custom artwork instead. */
  index?: number;
  leading?: ReactNode;
  className?: string;
}

/** Single-choice card with number badge and radio dot (Sex, Experience, Goal, …). */
export function OptionCard({
  title,
  description,
  selected,
  onPress,
  index,
  leading,
  className,
}: OptionCardProps) {
  return (
    <PressableScale
      haptic="select"
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className={cn(
        'flex-row items-center gap-3.5 rounded-[22px] border-2 bg-surface py-4 pr-[18px] pl-4',
        selected ? 'border-accent' : 'border-line',
        className,
      )}
    >
      {leading ??
        (index !== undefined ? (
          <View
            className={cn(
              'size-12 items-center justify-center rounded-full',
              selected ? 'bg-accent' : 'bg-pill',
            )}
          >
            <Text variant="headline" tone={selected ? 'onAccent' : 'default'} className="text-lg">
              {index}
            </Text>
          </View>
        ) : null)}
      <View className="flex-1 gap-[3px]">
        <Text variant="bodyStrong">{title}</Text>
        {description ? (
          <Text variant="paragraph" tone="subtle" className="text-sm leading-5">
            {description}
          </Text>
        ) : null}
      </View>
      <View
        className={cn(
          'size-6 rounded-full',
          selected ? 'border-[7px] border-accent' : 'border-[1.5px] border-track',
        )}
      />
    </PressableScale>
  );
}
