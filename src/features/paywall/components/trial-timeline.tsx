import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';

export interface TrialStep {
  title: string;
  body: string;
}

export interface TrialTimelineProps {
  /** The first step is "today" and shown as done. */
  steps: TrialStep[];
}

/** Vertical trial timeline: check for today, dots for the upcoming milestones. */
export function TrialTimeline({ steps }: TrialTimelineProps) {
  return (
    <View>
      {steps.map((step, i) => {
        const done = i === 0;
        const last = i === steps.length - 1;
        return (
          <View key={i} className="flex-row gap-3.5">
            <View className="items-center">
              <View
                className={cn(
                  'size-8.5 items-center justify-center rounded-full',
                  done ? 'bg-accent' : 'bg-raised',
                )}
              >
                {done ? (
                  <Icon name="check" size={12} color={colors.onAccent} />
                ) : (
                  <View className="size-2 rounded-full bg-fg" />
                )}
              </View>
              {last ? null : (
                <View
                  className={cn(
                    'my-1 min-h-8.5 w-0.75 flex-1 rounded-sm',
                    done ? 'bg-accent' : 'bg-line',
                  )}
                />
              )}
            </View>
            <View className={cn('flex-1 pt-1.5', !last && 'pb-4.5')}>
              <Text variant="bodyStrong" className="text-base leading-5">
                {step.title}
              </Text>
              <Text tone="subtle" className="mt-0.75 text-[13px] leading-4.5">
                {step.body}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
