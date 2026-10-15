import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, useWindowDimensions, View } from 'react-native';

import { openPlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { useWorkoutDraftStore } from '@/features/workout/stores/workout-draft-store';
import { TabScreen } from '@/shared/components/tab-screen';
import {
  blockWeekOf,
  isDeloadWeek,
  type PlanStatus,
  type PlanSummary,
  useCurrentPlan,
  usePlanStatus,
} from '@/shared/data/plans';
import { useUnits } from '@/shared/data/profile';
import { type RoutineSummary, useRoutines } from '@/shared/data/routines';
import { useActiveWorkout } from '@/shared/data/workouts';
import { useToday } from '@/shared/hooks/use-today';
import { mondayIndex } from '@/shared/lib/date';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { BlockProgress } from '../components/block-progress';
import { DoneCard } from '../components/done-card';
import { PlanPrompt } from '../components/plan-prompt';
import { RoutineCard } from '../components/routine-card';
import { WeekStrip } from '../components/week-strip';
import { useWeekWorkouts } from '../hooks/use-week-workouts';

/** Day `index` of the week strip, picked on `day` (the `useToday` key). */
interface DayPick {
  day: number;
  index: number;
}

/** Room between the cards, and how much of the next one shows beside the first. */
const CARD_GAP = 12;
const CARD_PEEK = 30;

/**
 * Where a card's routine falls from now on, when the routines are done in their order: the
 * session of its plan week ("Training 2 von 3"), how many weeks ahead, and whether that week is a
 * deload.
 */
function slotOf(index: number, plan: PlanSummary, status: PlanStatus) {
  const slot = status.done + index;
  const weeksAhead = Math.floor(slot / plan.sessionsPerWeek);
  return {
    session: (slot % plan.sessionsPerWeek) + 1,
    weeksAhead,
    deload: isDeloadWeek(blockWeekOf(status.week + weeksAhead, plan), plan),
  };
}

export function TodayScreen() {
  const { t } = useTranslation('today');
  // The tab stays mounted: the day comes from a clock so it moves on overnight, and a picked
  // day only counts on the day it was picked.
  const dayKey = useToday();
  const today = new Date(dayKey);
  const [pick, setPick] = useState<DayPick | null>(null);
  const selected = pick?.day === dayKey ? pick.index : mondayIndex(today);
  const select = (index: number) => setPick({ day: dayKey, index });
  const { width } = useWindowDimensions();
  const units = useUnits();
  const { data: active } = useActiveWorkout();
  const { days, isLoading: weekLoading } = useWeekWorkouts(today);
  const day = days[selected];
  const { plan, profile, isLoading: planLoading } = useCurrentPlan();
  const status = usePlanStatus(plan);
  const { data: routines = [], isLoading: routinesLoading } = useRoutines();
  const planRoutines = plan ? routines.filter((r) => r.planId === plan.id) : [];
  // The routines in the order they come up; while every one is still empty, the first, to fill.
  const upcoming = (status?.routineOrder ?? []).flatMap((id) => {
    const routine = planRoutines.find((r) => r.id === id);
    return routine ? [routine] : [];
  });
  const cards: RoutineSummary[] = upcoming.length ? upcoming : planRoutines.slice(0, 1);
  const cardWidth = cards.length > 1 ? width - 16 - CARD_GAP - CARD_PEEK : width - 32;
  // Nothing shows until the day and the plan are known, so no card flashes in the wrong state.
  const loading = weekLoading || planLoading || routinesLoading || (!!plan && !status);

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

  // A finished workout wins; a day without one shows the plan's block and its routines side by
  // side, the next one first; without a plan, or with an empty one, a way to fill it.
  function dayCard(): ReactNode {
    if (day.workout) {
      return <DoneCard workout={day.workout} date={day.date} today={today} units={units} />;
    }
    if (plan && status && cards.length) {
      return (
        <>
          {plan.blockWeeks && status.blockWeek !== null ? (
            <BlockProgress
              planName={plan.name}
              blockWeek={status.blockWeek}
              blockWeeks={plan.blockWeeks}
            />
          ) : null}
          <ScrollView
            // A day picked anew starts from the next routine.
            key={selected}
            horizontal
            showsHorizontalScrollIndicator={false}
            // As tall as its cards; a horizontal ScrollView grows by default.
            style={{ flexGrow: 0 }}
            snapToInterval={cardWidth + CARD_GAP}
            decelerationRate="fast"
            disableIntervalMomentum
            contentContainerStyle={{ gap: CARD_GAP, paddingHorizontal: 16 }}
          >
            {cards.map((routine, i) => {
              const { session, weeksAhead, deload } = slotOf(i, plan, status);
              const sessionLabel = t('session', { n: session, total: plan.sessionsPerWeek });
              let detail = sessionLabel;
              if (weeksAhead === 1) detail = t('nextWeek', { session: sessionLabel });
              else if (weeksAhead > 1) {
                detail = t('inWeeks', { count: weeksAhead, session: sessionLabel });
              }
              return (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  kind={i === 0 ? 'next' : 'later'}
                  label={t(i === 0 ? 'status.recommended' : 'status.after')}
                  detail={routine.exerciseCount ? detail : undefined}
                  deload={deload}
                  date={day.date}
                  today={today}
                  activeWorkoutId={active?.id ?? null}
                  width={cardWidth}
                />
              );
            })}
          </ScrollView>
        </>
      );
    }
    if (plan) {
      return (
        <PlanPrompt
          title={t('emptyPlan.title')}
          body={t('emptyPlan.body')}
          onPress={() => router.push(`/plan/${plan.id}`)}
        />
      );
    }
    return (
      <PlanPrompt
        title={t('noPlan.title')}
        body={t('noPlan.body')}
        onPress={() => openPlanFlow(profile, '/')}
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
      {loading ? null : dayCard()}
    </TabScreen>
  );
}
