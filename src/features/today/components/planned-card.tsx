import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { muscleShares } from '@/shared/data/muscles';
import type { TemplateSummary } from '@/shared/data/templates';
import { startWorkout } from '@/shared/data/workouts';
import { formatDate } from '@/shared/lib/format';
import { haptics } from '@/shared/lib/haptics';
import { cn } from '@/shared/lib/cn';
import { requireUserId } from '@/shared/stores/session-store';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';

import { markTemplateDone } from '../data/today-mutations';
import { isSameDay, startOfDay } from '../lib/week';
import { DayStatus } from './day-status';
import { WorkoutDayCard } from './workout-day-card';

export interface PlannedCardProps {
  template: TemplateSummary;
  date: Date;
  today: Date;
  /** Running workout; starting is replaced by resuming it. */
  activeWorkoutId: string | null;
  onReschedule: () => void;
}

export function PlannedCard({
  template,
  date,
  today,
  activeWorkoutId,
  onReschedule,
}: PlannedCardProps) {
  const { t } = useTranslation('today');
  const [busy, setBusy] = useState(false);
  const shares = useMemo(() => muscleShares(template.items), [template.items]);
  const isFuture = startOfDay(date) > startOfDay(today);
  const label = isSameDay(date, today)
    ? t('status.plannedToday')
    : t('status.planned', {
        date: formatDate(date, { weekday: 'short', day: 'numeric', month: 'short' }),
      });

  const start = async () => {
    if (activeWorkoutId) {
      router.push(`/workout/${activeWorkoutId}`);
      return;
    }
    setBusy(true);
    try {
      const id = await startWorkout(requireUserId(), template.name, template.id);
      router.push(`/workout/${id}`);
    } finally {
      setBusy(false);
    }
  };

  const markDone = async () => {
    await markTemplateDone(
      requireUserId(),
      template.id,
      template.name,
      date,
      template.estimatedMinutes,
    );
    haptics.success();
  };

  return (
    <WorkoutDayCard
      status={<DayStatus kind="planned" label={label} />}
      name={template.name}
      shares={shares}
      stats={[
        { icon: 'timer', label: t('stats.approxMinutes', { count: template.estimatedMinutes }) },
        {
          icon: 'dumbbell',
          label: `${t('stats.exercises', { count: template.exerciseCount })} · ${t('stats.sets', { count: template.setCount })}`,
        },
      ]}
      actions={
        <View className="flex-row gap-2">
          <Button
            label={activeWorkoutId ? t('resume') : t('start')}
            size="md"
            className="flex-1"
            loading={busy}
            onPress={start}
          />
          <Button
            label={t('reschedule')}
            variant="secondary"
            size="md"
            className="flex-1"
            onPress={onReschedule}
          />
          <IconButton
            icon="check"
            size={48}
            iconSize={16}
            haptic="none"
            disabled={isFuture}
            accessibilityLabel={t('markDone')}
            className={cn('bg-control', isFuture && 'opacity-35')}
            onPress={markDone}
          />
        </View>
      }
    />
  );
}
