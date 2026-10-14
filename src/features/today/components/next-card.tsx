import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useStartRoutine } from '@/features/training/hooks/use-start-routine';
import { muscleShares } from '@/shared/data/muscles';
import type { RoutineSummary } from '@/shared/data/routines';
import { cn } from '@/shared/lib/cn';
import { startOfDay } from '@/shared/lib/date';
import { haptics } from '@/shared/lib/haptics';
import { requireUserId } from '@/shared/stores/session-store';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';
import { Text } from '@/shared/ui/text';

import { markRoutineDone } from '../data/today-mutations';
import { DayStatus } from './day-status';
import { WorkoutDayCard } from './workout-day-card';

export interface NextCardProps {
  routine: RoutineSummary;
  /** Status line, e.g. "Als Nächstes · Woche 2 von 5". */
  label: string;
  /** A deload week: half the sets, and a line saying so. */
  deload: boolean;
  /** The day shown; marking done logs the routine on it. */
  date: Date;
  today: Date;
  /** Running workout; starting is replaced by resuming it. */
  activeWorkoutId: string | null;
  /** "Anderes Training"; left out when the plan has nothing else. */
  onOther?: () => void;
}

/** The routine to do next with start, another routine of the plan, or logging it as done. */
export function NextCard({
  routine,
  label,
  deload,
  date,
  today,
  activeWorkoutId,
  onOther,
}: NextCardProps) {
  const { t } = useTranslation('today');
  const [busy, setBusy] = useState(false);
  const { start, startingId } = useStartRoutine();
  const starting = startingId === routine.id;
  const shares = muscleShares(routine.items);
  const isFuture = startOfDay(date) > startOfDay(today);
  // A deload keeps the first half of each exercise's sets (see `setsForWeek`).
  const sets = deload
    ? routine.items.reduce((sum, item) => sum + Math.ceil(item.sets / 2), 0)
    : routine.setCount;

  const markDone = async () => {
    if (busy || starting) return;
    setBusy(true);
    // No `finally`: the React Compiler can't compile a component with one.
    try {
      await markRoutineDone(
        requireUserId(),
        routine.id,
        routine.name,
        date,
        routine.estimatedMinutes,
      );
      haptics.success();
    } catch (error) {
      setBusy(false);
      throw error;
    }
    setBusy(false);
  };

  return (
    <WorkoutDayCard
      status={
        <View className="gap-2">
          <DayStatus kind="next" label={label} />
          {deload ? (
            <Text variant="caption" tone="subtle" className="font-inter">
              {t('deloadHint')}
            </Text>
          ) : null}
        </View>
      }
      name={routine.name}
      shares={shares}
      stats={[
        { icon: 'timer', label: t('stats.approxMinutes', { count: routine.estimatedMinutes }) },
        {
          icon: 'dumbbell',
          label: `${t('stats.exercises', { count: routine.exerciseCount })} · ${t('stats.sets', { count: sets })}`,
        },
      ]}
      actions={
        <View className="flex-row gap-2">
          <Button
            label={activeWorkoutId ? t('resume') : t('start')}
            size="md"
            className="flex-1"
            loading={busy || starting}
            onPress={() => start(routine)}
          />
          {onOther ? (
            <Button label={t('other')} variant="secondary" size="md" onPress={onOther} />
          ) : null}
          <IconButton
            icon="check"
            size={48}
            iconSize={16}
            haptic="none"
            disabled={isFuture || busy || starting}
            accessibilityLabel={t('markDone')}
            className={cn('bg-control', isFuture && 'opacity-35')}
            onPress={markDone}
          />
        </View>
      }
    />
  );
}
