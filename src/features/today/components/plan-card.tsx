import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { PlanProgress } from '@/features/training/components/plan-progress';
import { MuscleStack, useRoutineMeta } from '@/features/training/components/routine-row';
import { muscleShares } from '@/shared/data/muscles';
import { deloadSetCount, type PlanStatus, type PlanSummary } from '@/shared/data/plans';
import { estimateMinutes, type RoutineSummary } from '@/shared/data/routines';
import { attempt } from '@/shared/lib/async';
import { cn } from '@/shared/lib/cn';
import { isSameDay, startOfDay } from '@/shared/lib/date';
import { formatWeekdayDate } from '@/shared/lib/format';
import { haptics } from '@/shared/lib/haptics';
import { colors } from '@/shared/lib/theme';
import { requireUserId } from '@/shared/stores/session-store';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { IconButton } from '@/shared/ui/icon-button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { markRoutineDone } from '../data/today-mutations';

export interface PlanCardProps {
  plan: PlanSummary;
  status: PlanStatus;
  /** The routine that comes next; undefined while none has exercises. */
  next: RoutineSummary | undefined;
  /** The day picked in the week strip; marking done logs the routine on it. */
  date: Date;
  today: Date;
  /** False when the picked day has a workout already: no second one is logged on it. */
  canMarkDone: boolean;
  /** Running workout; starting is replaced by resuming it. */
  activeWorkoutId: string | null;
  /** The screen's one starter, so two starts can't race (see `useStartRoutine`). */
  startingId: string | null;
  onStart: (routine: RoutineSummary) => void;
}

/**
 * The plan Training follows: its name, goal and block, where it stands, and the routine that
 * comes next with start and mark done. The top opens the plan, the routine its page.
 */
export function PlanCard({
  plan,
  status,
  next,
  date,
  today,
  canMarkDone,
  activeWorkoutId,
  startingId,
  onStart,
}: PlanCardProps) {
  const { t } = useTranslation(['today', 'training']);
  const meta = useRoutineMeta();
  const [busy, setBusy] = useState(false);
  const starting = !!next && startingId === next.id;
  const isFuture = startOfDay(date) > startOfDay(today);
  const goal = [
    t('training:card.perWeek', { count: plan.sessionsPerWeek }),
    plan.blockWeeks ? t('training:card.block', { build: plan.blockWeeks - 1 }) : null,
  ]
    .filter(Boolean)
    .join(' · ');
  // Another day picked: its date instead, as the routine is the one for that day.
  const nextLabel = isSameDay(date, today) ? t('status.next') : formatWeekdayDate(date);

  const markDone = async () => {
    if (!next || busy || starting) return;
    setBusy(true);
    // A deload keeps the first half of each exercise's sets (see `setsForWeek`).
    const minutes = status.deload
      ? estimateMinutes(next.items.map((i) => ({ ...i, sets: deloadSetCount(i.sets) })))
      : next.estimatedMinutes;
    const done = await attempt('Logging the routine as done failed', () =>
      markRoutineDone(requireUserId(), next.id, next.name, date, minutes),
    );
    if (done) haptics.success();
    setBusy(false);
  };

  return (
    <View className="mx-4 gap-5 rounded-[24px] bg-surface p-5">
      <PressableScale
        haptic="tap"
        activeScale={0.98}
        accessibilityRole="button"
        accessibilityLabel={`${plan.name}, ${goal}`}
        accessibilityHint={t('training:myPlan.openPlan')}
        onPress={() => router.push(`/plan/${plan.id}`)}
        className="gap-5"
      >
        <View className="flex-row items-center gap-3">
          <View className="min-w-0 flex-1 gap-1">
            <Text variant="headline" numberOfLines={1} className="text-[22px] leading-7">
              {plan.name}
            </Text>
            <Text variant="caption" tone="subtle" className="font-inter-medium">
              {goal}
            </Text>
          </View>
          <Icon name="chevron-right" size={7} color={colors.dim} />
        </View>
        <PlanProgress plan={plan} status={status} />
        {status.deload ? (
          <Text variant="caption" tone="subtle" className="-mt-2 font-inter">
            {t('deloadHint')}
          </Text>
        ) : null}
      </PressableScale>

      {next ? (
        <>
          <PressableScale
            haptic="tap"
            activeScale={0.98}
            accessibilityRole="button"
            accessibilityLabel={`${nextLabel}: ${next.name}, ${meta(next)}`}
            onPress={() => router.push(`/routine/${next.id}`)}
            className="flex-row items-center gap-3.5"
          >
            <MuscleStack shares={muscleShares(next.items)} highlight />
            <View className="min-w-0 flex-1 gap-0.5">
              <Text variant="overline" tone="accent" numberOfLines={1} className="text-[11px]">
                {nextLabel}
              </Text>
              <Text variant="headline" numberOfLines={1}>
                {next.name}
              </Text>
              <Text variant="caption" tone="subtle" numberOfLines={1} className="font-inter-medium">
                {meta(next)}
              </Text>
            </View>
          </PressableScale>
          <View className="flex-row gap-2">
            <Button
              label={activeWorkoutId ? t('resume') : t('startWorkout')}
              icon={activeWorkoutId ? undefined : 'play'}
              className="flex-1"
              loading={starting || busy}
              onPress={() => onStart(next)}
            />
            {canMarkDone ? (
              <IconButton
                icon="check"
                size={60}
                iconSize={18}
                haptic="none"
                // While a workout runs it would take a later place in the plan.
                disabled={isFuture || busy || starting || !!activeWorkoutId}
                accessibilityLabel={t('markDone')}
                className={cn('bg-control', (isFuture || activeWorkoutId) && 'opacity-35')}
                onPress={markDone}
              />
            ) : null}
          </View>
        </>
      ) : (
        // Nothing to start yet: every routine still needs its exercises.
        <View className="gap-3">
          <Text variant="paragraph" tone="subtle">
            {t('training:card.empty')}
          </Text>
          <Button
            label={t('training:myPlan.openPlan')}
            variant="secondary"
            size="md"
            onPress={() => router.push(`/plan/${plan.id}`)}
          />
        </View>
      )}
    </View>
  );
}
