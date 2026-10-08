import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import type { ImportedDay } from '../lib/plan-import-service';
import { REVIEW_COLOR } from './imported-exercise-row';

export interface DayTabsProps {
  days: ImportedDay[];
  selected: number;
  onSelect: (index: number) => void;
}

/** Horizontal tabs, one per detected training day; amber dot = still needs a check. */
export function DayTabs({ days, selected, onSelect }: DayTabsProps) {
  const { t } = useTranslation();
  const short = t('weekdays.short', { returnObjects: true });
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 px-4"
    >
      {days.map((day, i) => {
        const on = i === selected;
        const pending = !!day.rawDay || day.exercises.some((e) => e.raw);
        const weekday = day.rawDay ? '?' : day.weekday !== null ? short[day.weekday] : '–';
        return (
          <PressableScale
            key={i}
            haptic="select"
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onSelect(i)}
            className={cn(
              'h-11 flex-row items-center gap-2 rounded-full pr-4 pl-1.5',
              on ? 'bg-accent' : 'bg-pill',
            )}
          >
            <View
              className={cn(
                'h-8 min-w-8 items-center justify-center rounded-full px-1.5',
                on ? 'bg-on-accent/15' : 'bg-elevated',
              )}
            >
              <Text variant="caption" tone={on ? 'onAccent' : 'secondary'}>
                {weekday}
              </Text>
            </View>
            <Text variant="label" tone={on ? 'onAccent' : 'default'} numberOfLines={1}>
              {day.name}
            </Text>
            {pending ? (
              <View className="size-2 rounded-full" style={{ backgroundColor: REVIEW_COLOR }} />
            ) : null}
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}
