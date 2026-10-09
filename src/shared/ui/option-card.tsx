import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';

import { PressableScale } from './pressable-scale';
import { RadioDot } from './radio-dot';
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
        'flex-row items-center gap-3.5 rounded-[22px] bg-surface',
        // The design draws the ring inside 16/18pt padding, so the border eats into it.
        selected
          ? 'border-2 border-accent py-3.5 pr-4 pl-3.5'
          : 'border border-line py-3.75 pr-4.25 pl-3.75',
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
      <View className="flex-1 gap-0.75">
        <Text variant="bodyStrong">{title}</Text>
        {description ? (
          <Text variant="paragraph" tone="subtle" className="text-sm leading-4.25">
            {description}
          </Text>
        ) : null}
      </View>
      <RadioDot selected={selected} />
    </PressableScale>
  );
}
