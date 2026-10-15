import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ExerciseThumb } from '@/features/exercises/components/exercise-thumb';
import { useStartRoutine } from '@/features/training/hooks/use-start-routine';
import { isTimed, useExerciseName } from '@/shared/data/exercises';
import { mainShares, muscleShares } from '@/shared/data/muscles';
import { deloadSetCount } from '@/shared/data/plans';
import {
  estimateMinutes,
  type RoutineExerciseDetail,
  type RoutineSummary,
  useRoutineDetail,
} from '@/shared/data/routines';
import { attempt } from '@/shared/lib/async';
import { cn } from '@/shared/lib/cn';
import { startOfDay } from '@/shared/lib/date';
import { formatTargetLabel } from '@/shared/lib/format';
import { haptics } from '@/shared/lib/haptics';
import { requireUserId } from '@/shared/stores/session-store';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';
import { MuscleMap } from '@/shared/ui/muscle-map';
import { Text } from '@/shared/ui/text';

import { markRoutineDone } from '../data/today-mutations';
import { DayStatus } from './day-status';

/** Exercises the card lists; the rest are counted. */
const PREVIEW = 2;

interface ExercisePreviewProps {
  exercise: RoutineExerciseDetail;
  deload: boolean;
}

/** One exercise of the card: its photo, name and sets, e.g. "4 × 8–10 Wdh.". */
function ExercisePreview({ exercise, deload }: ExercisePreviewProps) {
  const { t, i18n } = useTranslation('today');
  const name = useExerciseName(exercise.exerciseId, i18n.language);
  const { sets } = exercise;
  const count = deload ? deloadSetCount(sets.length) : sets.length;
  const mins = sets.flatMap((s) => (s.targetMin === null ? [] : [s.targetMin]));
  const maxes = sets.flatMap((s) => (s.targetMax === null ? [] : [s.targetMax]));
  const target = formatTargetLabel(
    mins.length ? Math.min(...mins) : null,
    maxes.length ? Math.max(...maxes) : null,
    isTimed(exercise.exerciseId),
  );
  return (
    <View className="flex-row items-center gap-3.5">
      <ExerciseThumb
        exerciseId={exercise.exerciseId}
        name={name}
        className="size-13 rounded-xl bg-elevated"
      />
      <View className="min-w-0 flex-1 gap-0.5">
        <Text variant="label" numberOfLines={1} className="text-base">
          {name}
        </Text>
        <Text variant="caption" tone="subtle" numberOfLines={1} className="font-inter-medium">
          {target ? `${count} × ${target}` : t('stats.sets', { count })}
        </Text>
      </View>
    </View>
  );
}

export interface RoutineCardProps {
  routine: RoutineSummary;
  /** "Coach empfiehlt" on the next routine, "Danach" on the ones after it. */
  kind: 'next' | 'later';
  label: string;
  /** Under the label, e.g. "Training 2 von 3". */
  detail?: string;
  /** Its week is a deload: half the sets, and a line saying so. */
  deload: boolean;
  /** The day shown; marking done logs the routine on it. */
  date: Date;
  today: Date;
  /** Running workout; starting is replaced by resuming it. */
  activeWorkoutId: string | null;
  width: number;
}

/**
 * A routine of the plan on Today: what it trains, its first exercises with their sets, start and
 * mark done. Cards of the plan's routines sit side by side, the next one first.
 */
export function RoutineCard({
  routine,
  kind,
  label,
  detail,
  deload,
  date,
  today,
  activeWorkoutId,
  width,
}: RoutineCardProps) {
  const { t } = useTranslation(['today', 'training', 'muscles']);
  const [busy, setBusy] = useState(false);
  const { start, startingId } = useStartRoutine();
  const { data: detailed } = useRoutineDetail(routine.id);
  const exercises = detailed?.exercises ?? [];
  const starting = startingId === routine.id;
  const isFuture = startOfDay(date) > startOfDay(today);
  const muscles = mainShares(muscleShares(routine.items)).map((s) => s.muscle);
  const summary = muscles
    .slice(0, 3)
    .map((m) => t(`muscles:names.${m}`))
    .join(' · ');
  // A deload keeps the first half of each exercise's sets (see `setsForWeek`).
  const minutes = deload
    ? estimateMinutes(routine.items.map((i) => ({ ...i, sets: deloadSetCount(i.sets) })))
    : routine.estimatedMinutes;
  const more = routine.exerciseCount - PREVIEW;

  const markDone = async () => {
    if (busy || starting) return;
    setBusy(true);
    const done = await attempt('Logging the routine as done failed', () =>
      markRoutineDone(requireUserId(), routine.id, routine.name, date, minutes),
    );
    if (done) haptics.success();
    setBusy(false);
  };

  return (
    <View style={{ width }} className="gap-4 rounded-[28px] border border-white/8 bg-[#151515] p-5">
      <View className="flex-row gap-3">
        <View className="min-w-0 flex-1 gap-4">
          <DayStatus kind={kind} label={label} detail={detail} />
          <View className="gap-1.5">
            <Text
              variant="headline"
              numberOfLines={2}
              className="text-[30px] leading-9 tracking-[-0.3px]"
            >
              {routine.name}
            </Text>
            {summary ? (
              <Text tone="muted" className="text-sm">
                {summary}
              </Text>
            ) : null}
          </View>
        </View>
        <View
          className="h-17 flex-row gap-1"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <View className="h-full w-8.5">
            <MuscleMap view="front" selected={muscles} />
          </View>
          <View className="h-full w-8.5">
            <MuscleMap view="back" selected={muscles} />
          </View>
        </View>
      </View>

      {deload ? (
        <Text variant="caption" tone="subtle" className="font-inter">
          {t('deloadHint')}
        </Text>
      ) : null}

      {exercises.length ? (
        <View className="gap-3">
          {exercises.slice(0, PREVIEW).map((exercise) => (
            <ExercisePreview key={exercise.id} exercise={exercise} deload={deload} />
          ))}
          {more > 0 ? (
            <Text variant="caption" tone="subtle" className="font-inter-medium">
              {t('moreExercises', { count: more })}
            </Text>
          ) : null}
        </View>
      ) : null}

      {/* The buttons sit at the bottom, level across cards of different heights. */}
      {routine.exerciseCount ? (
        <View className="mt-auto flex-row gap-2">
          <Button
            label={activeWorkoutId ? t('resume') : t('start')}
            size="md"
            className="flex-1"
            loading={busy || starting}
            onPress={() => start(routine)}
          />
          <IconButton
            icon="check"
            size={48}
            iconSize={16}
            haptic="none"
            // While a workout runs it would take a later place in the plan.
            disabled={isFuture || busy || starting || !!activeWorkoutId}
            accessibilityLabel={t('markDone')}
            className={cn('bg-control', (isFuture || activeWorkoutId) && 'opacity-35')}
            onPress={markDone}
          />
        </View>
      ) : (
        // Nothing to start or log yet: the routine needs its exercises first.
        <Button
          label={t('training:overview.addExercise')}
          icon="plus"
          variant="secondary"
          size="md"
          className="mt-auto"
          onPress={() => router.push(`/routine/${routine.id}`)}
        />
      )}
    </View>
  );
}
