import { router } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { muscleShares } from '@/shared/data/muscles';
import type { WorkoutSummary } from '@/shared/data/workouts';
import { isSameDay, minutesBetween } from '@/shared/lib/date';
import { formatWeekdayDate, formatWeight, type UnitSystem } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';

import { DayStatus } from './day-status';
import { type DayStat, WorkoutDayCard } from './workout-day-card';

export interface DoneCardProps {
  workout: WorkoutSummary;
  date: Date;
  today: Date;
  units: UnitSystem;
}

export function DoneCard({ workout, date, today, units }: DoneCardProps) {
  const { t } = useTranslation('today');
  const shares = useMemo(() => muscleShares(workout.items), [workout.items]);
  const stats: DayStat[] = [
    {
      icon: 'timer',
      label: t('stats.minutes', { count: minutesBetween(workout.startedAt, workout.finishedAt) }),
    },
  ];
  // Reps-only and timed workouts have no volume.
  if (workout.volumeKg > 0) {
    stats.push({ icon: 'dumbbell', label: formatWeight(Math.round(workout.volumeKg), units) });
  }
  if (workout.prCount > 0) {
    stats.push({ icon: 'star', label: t('stats.prs', { count: workout.prCount }), accent: true });
  }
  const label = isSameDay(date, today)
    ? t('status.doneToday')
    : t('status.done', { date: formatWeekdayDate(date) });

  return (
    <WorkoutDayCard
      status={<DayStatus kind="done" label={label} />}
      name={workout.name}
      shares={shares}
      stats={stats}
      actions={
        <Button
          label={t('overview')}
          variant="secondary"
          size="md"
          onPress={() => router.push(`/workout/summary/${workout.id}`)}
        />
      }
    />
  );
}
