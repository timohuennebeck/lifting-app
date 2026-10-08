import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import type { RepRange } from '../lib/goal-ranges';

const SCALE = 15;

export interface GoalCardProps {
  index: number;
  title: string;
  description: string;
  reps: RepRange;
  selected: boolean;
  onPress: () => void;
}

/** Goal option card: number badge, copy, a 1–15 rep scale with the goal's range lit, radio. */
export function GoalCard({ index, title, description, reps, selected, onPress }: GoalCardProps) {
  const { t } = useTranslation('planCreate');
  return (
    <PressableScale
      haptic="select"
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityHint={t('goal.repsA11y', { min: reps.min, max: reps.max })}
      className={cn(
        'flex-row items-center gap-3.5 rounded-[22px] border-2 bg-surface py-4 pr-[18px] pl-4',
        selected ? 'border-accent' : 'border-line',
      )}
    >
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
      <View className="flex-1 gap-[3px]">
        <Text variant="bodyStrong">{title}</Text>
        <Text variant="paragraph" tone="subtle" className="text-sm leading-5">
          {description}
        </Text>
        <View className="mt-2 flex-row gap-[3px]" importantForAccessibility="no-hide-descendants">
          {Array.from({ length: SCALE }, (_, i) => {
            const on = i + 1 >= reps.min && i + 1 <= reps.max;
            return (
              <View
                key={i}
                className={cn(
                  'size-1.5 rounded-full',
                  on ? (selected ? 'bg-accent' : 'bg-fg-2') : 'bg-track',
                )}
              />
            );
          })}
        </View>
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
