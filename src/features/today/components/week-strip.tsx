import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { isSameDay } from '@/shared/lib/date';
import { colors } from '@/shared/lib/theme';
import { CheckBadge } from '@/shared/ui/check-item';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import type { WeekDay } from '../hooks/use-week-workouts';

export interface WeekStripProps {
  days: WeekDay[];
  today: Date;
  /** A day with a finished workout opens it. */
  onOpen: (workoutId: string) => void;
}

/** Mon–Sun strip: today ringed, an accent check on each day with a workout, which opens it. */
export function WeekStrip({ days, today, onOpen }: WeekStripProps) {
  const { t } = useTranslation();
  const narrow = t('weekdays.narrow', { returnObjects: true });
  const long = t('weekdays.long', { returnObjects: true });

  return (
    <View className="flex-row px-3.5 pt-3.5 pb-4">
      {days.map((day, i) => {
        const isToday = isSameDay(day.date, today);
        const label = (
          <Text
            variant="caption"
            tone={isToday ? 'default' : 'subtle'}
            className={cn(!isToday && 'font-inter-medium')}
          >
            {narrow[i]}
          </Text>
        );
        const { workout } = day;
        if (workout) {
          return (
            <PressableScale
              key={i}
              haptic="select"
              accessibilityRole="button"
              accessibilityLabel={`${long[i]}, ${workout.name}`}
              onPress={() => onOpen(workout.id)}
              className="flex-1 items-center gap-2"
            >
              {label}
              <View
                className={cn(
                  'size-10.25 items-center justify-center rounded-full',
                  isToday && 'border-[1.5px]',
                )}
                style={{ borderColor: isToday ? `${colors.accent}80` : undefined }}
              >
                <CheckBadge size={32} glyph={14} />
              </View>
            </PressableScale>
          );
        }
        return (
          <View
            key={i}
            accessible
            accessibilityLabel={long[i]}
            className="flex-1 items-center gap-2"
          >
            {label}
            <View className="size-10.25 items-center justify-center">
              {isToday ? <View className="absolute size-8.5 rounded-full bg-elevated" /> : null}
              <Text
                variant="label"
                tone={isToday ? 'default' : 'subtle'}
                className={cn('text-sm', !isToday && 'font-inter')}
              >
                {day.date.getDate()}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
