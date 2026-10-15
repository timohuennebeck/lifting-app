import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { MuscleStack } from '@/features/training/components/routine-row';
import { PagerPage } from '@/shared/components/pager-page';
import { muscleShares } from '@/shared/data/muscles';
import { useUnits } from '@/shared/data/profile';
import { useWorkoutCount, useWorkoutHistory, type WorkoutSummary } from '@/shared/data/workouts';
import { useToday } from '@/shared/hooks/use-today';
import { addDays, minutesBetween, startOfWeek, toIsoDate } from '@/shared/lib/date';
import { formatShortDate, formatVolume, formatWeekdayDate } from '@/shared/lib/format';
import { getOrInsert } from '@/shared/lib/map';
import { colors } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { Icon, type IconName } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

/** Workouts loaded at a time. */
const PAGE = 30;

interface StatProps {
  icon: IconName;
  label: string;
  accent?: boolean;
}

function Stat({ icon, label, accent }: StatProps) {
  return (
    <View className="flex-row items-center gap-1.25">
      <Icon name={icon} size={12} color={accent ? colors.accent : colors.subtle} />
      <Text variant="caption" tone={accent ? 'accent' : 'subtle'} className="font-inter-medium">
        {label}
      </Text>
    </View>
  );
}

interface HistoryCardProps {
  workout: WorkoutSummary;
}

/** A finished workout: the muscles it trained, when, its time, volume and records. */
function HistoryCard({ workout }: HistoryCardProps) {
  const { t } = useTranslation(['common', 'today']);
  const units = useUnits();
  const minutes = minutesBetween(workout.startedAt, workout.finishedAt);
  return (
    <PressableScale
      haptic="tap"
      activeScale={0.98}
      accessibilityRole="button"
      onPress={() => router.push(`/workout/summary/${workout.id}`)}
      className="flex-row items-center gap-3.5 rounded-[22px] bg-surface py-3.5 pr-4 pl-2.5"
    >
      <MuscleStack shares={muscleShares(workout.items)} highlight />
      <View className="min-w-0 flex-1 gap-1">
        <View className="gap-0.5">
          <Text variant="caption" tone="subtle" className="font-inter-medium">
            {formatWeekdayDate(new Date(workout.startedAt))}
          </Text>
          <Text variant="bodyStrong" numberOfLines={1}>
            {workout.name}
          </Text>
        </View>
        <View className="flex-row flex-wrap gap-x-3 gap-y-1">
          <Stat icon="timer" label={t('today:stats.minutes', { count: minutes })} />
          {/* Reps-only and timed workouts have no volume. */}
          {workout.volumeKg > 0 ? (
            <Stat icon="dumbbell" label={formatVolume(workout.volumeKg, units)} />
          ) : null}
          {workout.prCount > 0 ? (
            <Stat icon="star" label={t('today:stats.prs', { count: workout.prCount })} accent />
          ) : null}
        </View>
      </View>
    </PressableScale>
  );
}

interface Week {
  start: Date;
  workouts: WorkoutSummary[];
}

/** Workouts by the week (Monday to Sunday) they were done in, newest first. */
function byWeek(workouts: WorkoutSummary[]): Week[] {
  const weeks = new Map<string, Week>();
  for (const w of workouts) {
    const start = startOfWeek(new Date(w.startedAt));
    getOrInsert(weeks, toIsoDate(start), () => ({ start, workouts: [] })).workouts.push(w);
  }
  return [...weeks.values()];
}

/**
 * Fortschritt → Historie: every finished workout, newest first, by week, each week with how many
 * workouts and how much volume; a workout opens its summary.
 */
export function HistoryPage() {
  const { t } = useTranslation('common');
  const units = useUnits();
  const [limit, setLimit] = useState(PAGE);
  const { data: workouts = [], isLoading } = useWorkoutHistory(limit);
  const { data: total = 0 } = useWorkoutCount();
  // From the day, which moves on overnight while the tab stays mounted.
  const monday = startOfWeek(new Date(useToday()));
  const thisWeek = toIsoDate(monday);
  const lastWeek = toIsoDate(addDays(monday, -7));

  const weekTitle = (start: Date) => {
    const key = toIsoDate(start);
    if (key === thisWeek) return t('history.thisWeek');
    if (key === lastWeek) return t('history.lastWeek');
    return `${formatShortDate(start)} – ${formatShortDate(addDays(start, 6))}`;
  };

  return (
    <PagerPage>
      {workouts.length ? (
        <>
          {byWeek(workouts).map((week) => {
            const volume = week.workouts.reduce((sum, w) => sum + w.volumeKg, 0);
            const count = t('history.count', { count: week.workouts.length });
            return (
              <View key={toIsoDate(week.start)}>
                <View className="flex-row items-baseline justify-between gap-3 px-5 pt-7 pb-2.5">
                  <Text variant="overline" tone="subtle" className="text-[11px]">
                    {weekTitle(week.start)}
                  </Text>
                  <Text variant="caption" tone="subtle" className="font-inter-medium">
                    {volume > 0 ? `${count} · ${formatVolume(volume, units)}` : count}
                  </Text>
                </View>
                <View className="gap-2 px-4">
                  {week.workouts.map((w) => (
                    <HistoryCard key={w.id} workout={w} />
                  ))}
                </View>
              </View>
            );
          })}
          {total > workouts.length ? (
            <Button
              label={t('history.more')}
              variant="secondary"
              size="md"
              className="mx-4 mt-4"
              onPress={() => setLimit((l) => l + PAGE)}
            />
          ) : null}
        </>
      ) : !isLoading ? (
        <View className="items-center gap-2 px-8 pt-16">
          <Text variant="headline" className="text-center">
            {t('history.empty')}
          </Text>
          <Text variant="paragraph" tone="subtle" className="text-center">
            {t('history.emptyHint')}
          </Text>
        </View>
      ) : null}
      {/* The list ends 40pt above the tab bar inset; PagerPage adds 24. */}
      <View className="h-4" />
    </PagerPage>
  );
}
