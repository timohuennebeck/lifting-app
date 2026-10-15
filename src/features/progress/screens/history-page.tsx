import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { HistoryStat } from '@/features/workout/components/history-session-row';
import { PagerPage } from '@/shared/components/pager-page';
import { useExerciseName } from '@/shared/data/exercises';
import { useUnits } from '@/shared/data/profile';
import type { ExerciseItem } from '@/shared/data/routines';
import { useWorkoutCount, useWorkoutHistory, type WorkoutSummary } from '@/shared/data/workouts';
import { useToday } from '@/shared/hooks/use-today';
import { cn } from '@/shared/lib/cn';
import { minutesBetween } from '@/shared/lib/date';
import { formatDate, formatVolume } from '@/shared/lib/format';
import { monthSections } from '@/shared/lib/month-sections';
import { colors } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { ListRow } from '@/shared/ui/list-row';
import { Text } from '@/shared/ui/text';
/** Workouts loaded at a time. */
const PAGE = 30;

interface ExerciseLineProps {
  index: number;
  item: ExerciseItem;
}

/** One exercise of an opened workout: its number, name and how many sets were done. */
function ExerciseLine({ index, item }: ExerciseLineProps) {
  const { t, i18n } = useTranslation('common');
  const name = useExerciseName(item.exerciseId, i18n.language);
  return (
    <View className="h-11 flex-row items-center gap-3">
      <View className="size-7 items-center justify-center rounded-full bg-elevated">
        <Text variant="caption" className="tabular-nums">
          {index + 1}
        </Text>
      </View>
      <Text variant="bodyStrong" numberOfLines={1} className="min-w-0 flex-1">
        {name}
      </Text>
      <Text variant="caption" tone="subtle" className="font-inter-medium tabular-nums">
        {t('history.sets', { count: item.sets })}
      </Text>
    </View>
  );
}

interface WorkoutRowProps {
  workout: WorkoutSummary;
  /** The newest workout: its day in neon. */
  latest: boolean;
  open: boolean;
  onToggle: () => void;
}

/**
 * A finished workout, laid out like an exercise's past session: its day, name, time, volume and
 * records; it opens to its exercises and a way to its summary.
 */
function WorkoutRow({ workout, latest, open, onToggle }: WorkoutRowProps) {
  const { t } = useTranslation(['today', 'common']);
  const units = useUnits();
  const chevron = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(open ? '180deg' : '0deg', { duration: 200 }) }],
  }));
  return (
    <View className="px-2">
      <ListRow
        haptic="select"
        activeScale={0.99}
        accessibilityState={{ expanded: open }}
        onPress={onToggle}
        badge={formatDate(new Date(workout.startedAt), { day: 'numeric' })}
        highlight={latest}
        title={workout.name}
        subtitle={
          <View className="flex-row items-center gap-3.5">
            <HistoryStat
              icon="timer"
              value={t('stats.minutes', {
                count: minutesBetween(workout.startedAt, workout.finishedAt),
              })}
            />
            {/* Reps-only and timed workouts have no volume. */}
            {workout.volumeKg > 0 ? (
              <HistoryStat icon="dumbbell" value={formatVolume(workout.volumeKg, units)} />
            ) : null}
            {workout.prCount > 0 ? (
              <HistoryStat
                icon="star"
                color={colors.accent}
                value={t('stats.prs', { count: workout.prCount })}
              />
            ) : null}
          </View>
        }
        trailing={
          <Animated.View
            className="size-7 items-center justify-center rounded-full bg-chip"
            style={chevron}
          >
            <Icon name="chevron-down" size={12} color={colors.subtle} />
          </Animated.View>
        }
      />
      {open ? (
        <Animated.View entering={FadeIn.duration(180)} className="gap-0.5 px-1 pb-3">
          {workout.items.map((item, i) => (
            <ExerciseLine key={`${item.exerciseId}-${i}`} index={i} item={item} />
          ))}
          <Button
            label={t('overview')}
            variant="secondary"
            size="sm"
            className="mt-2 self-start"
            onPress={() => router.push(`/workout/summary/${workout.id}`)}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}

/** A faint sketch of the list: a week title and two workouts. */
function HistorySketch() {
  return (
    <View
      className="w-full gap-6"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View className="h-2.5 w-19 rounded-full bg-surface" />
      {[0, 1].map((row) => (
        <View key={row} className="flex-row items-center gap-4">
          <View className="size-12 rounded-full bg-surface" />
          <View className="flex-1 gap-2.5">
            <View className={cn('h-2.5 rounded-full bg-surface', row ? 'w-36' : 'w-28')} />
            <View className="flex-row gap-4">
              <View className="h-2 w-13 rounded-full bg-surface" />
              <View className="h-2 w-15 rounded-full bg-surface" />
              <View className="h-2 w-10.5 rounded-full bg-surface" />
            </View>
          </View>
          <View className="size-8 rounded-full bg-surface" />
        </View>
      ))}
    </View>
  );
}

/** Before the first finished workout: a sketch of the list and a way to train. */
function NoWorkouts() {
  const { t } = useTranslation('common');
  return (
    <View className="flex-1 items-center justify-center px-8 pb-12">
      <HistorySketch />
      <Text variant="headline" className="mt-10 text-center">
        {t('history.empty')}
      </Text>
      <Text variant="paragraph" tone="subtle" className="mt-2 text-center">
        {t('history.emptyHint')}
      </Text>
      {/* Heute has the plan's next workout and the empty one. */}
      <Button
        label={t('history.start')}
        className="mt-6 h-12 px-7"
        onPress={() => router.navigate('/')}
      />
    </View>
  );
}

/**
 * Fortschritt → Historie: every finished workout, newest first, by month, each like an exercise's
 * past session; one opens to its exercises.
 */
export function HistoryPage() {
  const { t } = useTranslation('common');
  const [limit, setLimit] = useState(PAGE);
  const [openId, setOpenId] = useState<string | null>(null);
  const { data: workouts = [], isLoading } = useWorkoutHistory(limit);
  const { data: total = 0 } = useWorkoutCount();
  // From the day, which moves on overnight while the tab stays mounted.
  const year = new Date(useToday()).getFullYear();

  return (
    <PagerPage>
      {workouts.length ? (
        <View className="px-2 pt-2.5">
          {monthSections(workouts, year).map((section) => (
            <View key={section.key}>
              <Text className="px-3 pt-4.5 pb-1.5 font-inter-semibold text-[11px] leading-3.5 tracking-[1.1px] text-dim">
                {section.title}
              </Text>
              {section.data.map((w) => (
                <WorkoutRow
                  key={w.id}
                  workout={w}
                  latest={w.id === workouts[0]?.id}
                  open={w.id === openId}
                  onToggle={() => setOpenId(w.id === openId ? null : w.id)}
                />
              ))}
            </View>
          ))}
          {total > workouts.length ? (
            <Button
              label={t('history.more')}
              variant="secondary"
              size="md"
              className="mx-2 mt-4"
              onPress={() => setLimit((l) => l + PAGE)}
            />
          ) : null}
        </View>
      ) : !isLoading ? (
        <NoWorkouts />
      ) : null}
      {/* The list ends 40pt above the tab bar inset; PagerPage adds 24. */}
      <View className="h-4" />
    </PagerPage>
  );
}
