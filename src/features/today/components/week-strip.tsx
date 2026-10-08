import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { cn } from '@/shared/lib/cn';
import { colors, useAccentColor } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import type { WeekDay } from '../hooks/use-week-plan';
import { isSameDay } from '../lib/week';

export interface WeekStripProps {
  days: WeekDay[];
  today: Date;
  selected: number;
  onSelect: (index: number) => void;
}

/** Mon–Sun strip: accent check for done days, dashed ring for planned days. */
export function WeekStrip({ days, today, selected, onSelect }: WeekStripProps) {
  const { t } = useTranslation();
  const accent = useAccentColor();
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
                  'size-[41px] items-center justify-center rounded-full',
                  isSelected && 'border-[1.5px]',
                )}
                style={{ borderColor: isSelected ? `${accent}80` : undefined }}
              >
                <View className="size-8 items-center justify-center rounded-full bg-accent">
                  <Icon name="check" size={14} color={colors.onAccent} />
                </View>
              </View>
            ) : (
              <View className="size-[41px] items-center justify-center">
                {day.planned ? (
                  <Svg width={38} height={38} viewBox="0 0 38 38" style={{ position: 'absolute' }}>
                    <Circle
                      cx={19}
                      cy={19}
                      r={17.5}
                      fill="none"
                      stroke={isSelected ? accent : '#4A4A47'}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeDasharray="13.3 5"
                      transform="rotate(-90 19 19)"
                    />
                  </Svg>
                ) : isSelected ? (
                  <View className="absolute size-[34px] rounded-full bg-elevated" />
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
