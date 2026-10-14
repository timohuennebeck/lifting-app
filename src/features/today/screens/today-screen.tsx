import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { openPlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { usePlanWeekLabel } from '@/features/training/hooks/use-plan-week-label';
import { useWorkoutDraftStore } from '@/features/workout/stores/workout-draft-store';
import { TabScreen } from '@/shared/components/tab-screen';
import { currentPlanId, usePlanStatus, usePlans } from '@/shared/data/plans';
import { useProfile, useUnits } from '@/shared/data/profile';
import { useRoutines } from '@/shared/data/routines';
import { useActiveWorkout } from '@/shared/data/workouts';
import { useToday } from '@/shared/hooks/use-today';
import { mondayIndex } from '@/shared/lib/date';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { DoneCard } from '../components/done-card';
import { NextCard } from '../components/next-card';
import { OtherRoutineSheet } from '../components/other-routine-sheet';
import { UnplannedDay } from '../components/unplanned-day';
import { WeekStrip } from '../components/week-strip';
import { useWeekWorkouts } from '../hooks/use-week-workouts';

export function TodayScreen() {
  const { t } = useTranslation('today');
  // The tab stays mounted: the day comes from a clock so it moves on overnight, and a picked
  // weekday (or routine) only counts on the day it was picked.
  const dayKey = useToday();
  const today = new Date(dayKey);
  const [pick, setPick] = useState<{ day: number; index: number } | null>(null);
  const selected = pick?.day === dayKey ? pick.index : mondayIndex(today);
  const select = (index: number) => setPick({ day: dayKey, index });
  // "Anderes Training": a routine picked instead of the next one, for that day only.
  const [other, setOther] = useState<{ day: number; index: number; routineId: string } | null>(
    null,
  );
  const [otherOpen, setOtherOpen] = useState(false);
  const units = useUnits();
  const { data: active } = useActiveWorkout();
  const days = useWeekWorkouts(today);
  const day = days[selected];
  const { profile } = useProfile();
  const { data: plans = [], isLoading: plansLoading } = usePlans();
  const plan = plans.find((p) => p.id === currentPlanId(profile?.activePlanId, plans));
  const status = usePlanStatus(plan);
  const weekLabel = usePlanWeekLabel();
  const { data: routines = [], isLoading: routinesLoading } = useRoutines();
  const planRoutines = plan ? routines.filter((r) => r.planId === plan.id) : [];
  const nextId = status?.nextRoutineId ?? null;
  const picked =
    other?.day === dayKey && other.index === selected
      ? planRoutines.find((r) => r.id === other.routineId)
      : undefined;
  const routine = picked ?? planRoutines.find((r) => r.id === nextId);

  const pills = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 px-4 pt-2 pb-0.5"
      className="grow-0"
    >
      {active ? (
        <PressableScale
          haptic="press"
          onPress={() => router.push(`/workout/${active.id}`)}
          className="h-10 flex-row items-center gap-1.75 rounded-full bg-accent px-3.75"
        >
          <Icon name="play" size={12} color={colors.onAccent} />
          <Text variant="caption" tone="onAccent" className="text-sm">
            {t('resumeActive', { name: active.name })}
          </Text>
        </PressableScale>
      ) : (
        <PressableScale
          haptic="press"
          onPress={() => {
            // Put together first, started from the builder.
            useWorkoutDraftStore.getState().begin(t('emptyWorkoutName'));
            router.push('/workout/new');
          }}
          className="h-10 flex-row items-center gap-1.75 rounded-full bg-elevated px-3.75"
        >
          <Icon name="plus" size={12} />
          <Text variant="caption" className="text-sm">
            {t('startEmpty')}
          </Text>
        </PressableScale>
      )}
    </ScrollView>
  );

  // A finished workout wins; a day without one shows what's next in the plan (or the routine
  // picked instead), and without a plan, or with an empty one, a way to fill it.
  let card: ReactNode = null;
  if (day.workout) {
    card = <DoneCard workout={day.workout} date={day.date} today={today} units={units} />;
  } else if (plan && status && routine) {
    const week = weekLabel(plan, status);
    card = (
      <NextCard
        routine={routine}
        label={picked ? week : `${t('status.next')} · ${week}`}
        deload={status.deload}
        date={day.date}
        today={today}
        activeWorkoutId={active?.id ?? null}
        onOther={planRoutines.length > 1 ? () => setOtherOpen(true) : undefined}
      />
    );
  } else if (plan && status && !routinesLoading) {
    card = (
      <UnplannedDay
        title={t('emptyPlan.title')}
        body={t('emptyPlan.body')}
        onPress={() => router.push(`/plan/${plan.id}`)}
      />
    );
  } else if (!plan && !plansLoading) {
    card = (
      <UnplannedDay
        title={t('unplanned.title')}
        body={t('unplanned.body')}
        onPress={() => openPlanFlow(profile)}
      />
    );
  }

  return (
    <TabScreen
      pinned={
        <View>
          {pills}
          <WeekStrip days={days} today={today} selected={selected} onSelect={select} />
        </View>
      }
    >
      {card}
      <OtherRoutineSheet
        visible={otherOpen}
        planName={plan?.name ?? ''}
        routines={planRoutines}
        shownId={routine?.id ?? null}
        nextId={nextId}
        onPick={(routineId) => {
          setOther({ day: dayKey, index: selected, routineId });
          setOtherOpen(false);
        }}
        onClose={() => setOtherOpen(false)}
      />
    </TabScreen>
  );
}
