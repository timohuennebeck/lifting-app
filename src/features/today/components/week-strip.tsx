import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { isSameDay } from '@/shared/lib/date';
import { colors } from '@/shared/lib/theme';
import { CheckBadge } from '@/shared/ui/check-item';
import { DashedRing } from '@/shared/ui/plan-slot';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import type { WeekDay } from '../hooks/use-week-plan';

export interface WeekStripProps {
  days: WeekDay[];
  today: Date;
  selected: number;
  onSelect: (index: number) => void;
}

/** Mon–Sun strip: accent check for done days, dashed ring for planned days. */
export function WeekStrip({ days, today, selected, onSelect }: WeekStripProps) {
  const { t } = useTranslation();
  const narrow = t('weekdays.narrow', { returnObjects: true });
  const long = t('weekdays.long', { returnObjects: true });

  return (
    <View className="flex-row px-3.5 pt-3.5 pb-4">
      {days.map((day, i) => {
        const isToday = isSameDay(day.date, today);
        const isSelected = i === selected;
        return (
          <PressableScale
            key={i}
            haptic="select"
            accessibilityRole="tab"
            accessibilityLabel={long[i]}
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(i)}
            className="flex-1 items-center gap-2"
          >
            <Text
              variant="caption"
              tone={isToday ? 'default' : 'subtle'}
              className={cn(!isToday && 'font-inter-medium')}
            >
              {narrow[i]}
            </Text>
            {day.workout ? (
              <View
                className={cn(
                  'size-10.25 items-center justify-center rounded-full',
                  isSelected && 'border-[1.5px]',
                )}
                style={{ borderColor: isSelected ? `${colors.accent}80` : undefined }}
              >
                <CheckBadge size={32} glyph={14} />
              </View>
            ) : (
              <View className="size-10.25 items-center justify-center">
                {day.planned ? (
                  <DashedRing color={isSelected ? colors.accent : '#4A4A47'} />
                ) : isSelected ? (
                  <View className="absolute size-8.5 rounded-full bg-elevated" />
                ) : null}
                <Text
                  variant="label"
                  tone={isSelected || day.planned ? 'default' : 'subtle'}
                  className={cn('text-sm', !isSelected && !day.planned && 'font-inter')}
                >
                  {day.date.getDate()}
                </Text>
              </View>
            )}
          </PressableScale>
        );
      })}
    </View>
  );
}
