import { useTranslation } from 'react-i18next';
import { FlatList, useWindowDimensions, View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { addDays, isSameDay } from '@/shared/lib/date';
import { formatDate } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { CheckBadge } from '@/shared/ui/check-item';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { useWeekWorkouts } from '../hooks/use-week-workouts';

/** How many weeks the strip reaches back and ahead of the current one. */
const PAST_WEEKS = 260;
const FUTURE_WEEKS = 52;
/** Each page's distance in weeks from the current week, oldest first. */
const OFFSETS = Array.from({ length: PAST_WEEKS + 1 + FUTURE_WEEKS }, (_, i) => i - PAST_WEEKS);
const LIST_STYLE = { flexGrow: 0, flexShrink: 0 };
const DAY_LABEL = { weekday: 'long', day: 'numeric', month: 'long' } as const;

export interface WeekStripProps {
  today: Date;
  /** A day with a finished workout opens it. */
  onOpen: (workoutId: string) => void;
}

/**
 * Mon–Sun strip, a week per page: it opens on this week and swipes to earlier and later ones,
 * snapping to each. Today is ringed, a day with a workout has an accent check that opens it.
 */
export function WeekStrip({ today, onOpen }: WeekStripProps) {
  // The strip spans the screen, so a page is as wide as the window.
  const { width } = useWindowDimensions();
  return (
    <FlatList
      data={OFFSETS}
      keyExtractor={(offset) => String(offset)}
      renderItem={({ item }) => (
        <WeekPage week={addDays(today, item * 7)} today={today} width={width} onOpen={onOpen} />
      )}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      // A horizontal list grows by default; this one is as tall as a week.
      style={LIST_STYLE}
      getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
      initialScrollIndex={PAST_WEEKS}
      // The week on screen and one on each side, so a swipe never shows an empty page.
      initialNumToRender={1}
      maxToRenderPerBatch={2}
      windowSize={3}
    />
  );
}

interface WeekPageProps {
  /** Any day of the week shown. */
  week: Date;
  today: Date;
  width: number;
  onOpen: (workoutId: string) => void;
}

function WeekPage({ week, today, width, onOpen }: WeekPageProps) {
  const { t } = useTranslation();
  const narrow = t('weekdays.narrow', { returnObjects: true });
  const { days } = useWeekWorkouts(week);

  return (
    <View className="flex-row px-3.5 pt-3.5 pb-4" style={{ width }}>
      {days.map((day, i) => {
        const isToday = isSameDay(day.date, today);
        // With the date: on another week the weekday alone doesn't say which day it is.
        const name = formatDate(day.date, DAY_LABEL);
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
              accessibilityLabel={`${name}, ${workout.name}`}
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
          <View key={i} accessible accessibilityLabel={name} className="flex-1 items-center gap-2">
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
