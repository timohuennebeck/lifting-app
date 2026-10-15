import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { openPlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { RoutineRow, useRoutineMeta } from '@/features/training/components/routine-row';
import { SectionTitle } from '@/features/training/components/section-title';
import { useStartRoutine } from '@/features/training/hooks/use-start-routine';
import { useWorkoutDraftStore } from '@/features/workout/stores/workout-draft-store';
import { TabScreen } from '@/shared/components/tab-screen';
import { useCurrentPlan, usePlanStatus } from '@/shared/data/plans';
import { useUnits } from '@/shared/data/profile';
import {
  type DoneDates,
  type RoutineSummary,
  useLastDone,
  useRoutines,
  useWeekDone,
} from '@/shared/data/routines';
import { useActiveWorkout } from '@/shared/data/workouts';
import { useToday } from '@/shared/hooks/use-today';
import { mondayIndex } from '@/shared/lib/date';
import { formatDate, formatWeekdayDate } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { DoneCard } from '../components/done-card';
import { PlanCard } from '../components/plan-card';
import { PlanPrompt } from '../components/plan-prompt';
import { WeekStrip } from '../components/week-strip';
import { useWeekWorkouts } from '../hooks/use-week-workouts';

/** Routines outside a plan shown without one, the ones done most recently first. */
const RECENT = 3;

/** Day `index` of the week strip, picked on `day` (the `useToday` key). */
interface DayPick {
  day: number;
  index: number;
}

interface RoutineRowsProps {
  routines: RoutineSummary[];
  /** When each was done; a done one says so (`doneLabel`) and shows a check. */
  done?: DoneDates;
  doneLabel?: (at: string) => string;
  /** The line under the name of the others, e.g. when they were done last. */
  meta: (routine: RoutineSummary) => string;
}

/** Routine cards with quick start; an empty routine opens instead, to add exercises. */
function RoutineRows({ routines, done = {}, doneLabel, meta }: RoutineRowsProps) {
  const { start, startingId } = useStartRoutine();
  return (
    <View className="gap-2 px-4">
      {routines.map((routine) => {
        const doneAt = doneLabel ? done[routine.id] : undefined;
        return (
          <RoutineRow
            key={routine.id}
            name={routine.name}
            items={routine.items}
            meta={doneAt && doneLabel ? doneLabel(doneAt) : meta(routine)}
            done={!!doneAt}
            starting={startingId === routine.id}
            onPress={() => router.push(`/routine/${routine.id}`)}
            onStart={() =>
              routine.exerciseCount ? start(routine) : router.push(`/routine/${routine.id}`)
            }
          />
        );
      })}
    </View>
  );
}

/**
 * Heute: the week with its workouts, the picked day's workout once done, then the plan Today
 * follows with where it stands, the routine the coach recommends and its other routines. Without
 * a plan, the routines done most recently and a way to get one.
 */
export function TodayScreen() {
  const { t } = useTranslation(['today', 'training']);
  // The tab stays mounted: the day comes from a clock so it moves on overnight, and a picked
  // day only counts on the day it was picked.
  const dayKey = useToday();
  const today = new Date(dayKey);
  const [pick, setPick] = useState<DayPick | null>(null);
  const selected = pick?.day === dayKey ? pick.index : mondayIndex(today);
  const select = (index: number) => setPick({ day: dayKey, index });
  const units = useUnits();
  const { data: active } = useActiveWorkout();
  const { days, isLoading: weekLoading } = useWeekWorkouts(today);
  const day = days[selected];
  const { plan, profile, isLoading: planLoading } = useCurrentPlan();
  const status = usePlanStatus(plan);
  const { data: routines = [], isLoading: routinesLoading } = useRoutines();
  const { data: doneThisWeek = {} } = useWeekDone(plan?.id, status?.week);
  const { data: lastDone = {} } = useLastDone();
  const meta = useRoutineMeta();

  const planRoutines = plan ? routines.filter((r) => r.planId === plan.id) : [];
  const next = planRoutines.find((r) => r.id === status?.nextRoutineId);
  const rest = planRoutines.filter((r) => r !== next);
  const recent = routines
    .filter((r) => r.planId === null && lastDone[r.id])
    .sort((a, b) => lastDone[b.id].localeCompare(lastDone[a.id]))
    .slice(0, RECENT);
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

  // The plan with its routines; an empty plan, a way to fill it; without a plan, the routines
  // done most recently and a way to get one.
  function planPart() {
    if (plan && status && planRoutines.length) {
      return (
        <>
          <PlanCard
            plan={plan}
            status={status}
            next={next}
            date={day.date}
            today={today}
            canMarkDone={!day.workout}
            activeWorkoutId={active?.id ?? null}
          />
          {rest.length ? (
            <>
              <SectionTitle>{t('training:myPlan.rest')}</SectionTitle>
              <RoutineRows
                routines={rest}
                done={doneThisWeek}
                doneLabel={(at) =>
                  t('training:myPlan.doneOn', {
                    day: formatDate(new Date(at), { weekday: 'short' }),
                  })
                }
                meta={meta}
              />
            </>
          ) : null}
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
      <>
        {recent.length ? (
          <>
            <SectionTitle>{t('training:all.recent')}</SectionTitle>
            <RoutineRows
              routines={recent}
              meta={(r) =>
                t('training:all.lastDone', { date: formatWeekdayDate(new Date(lastDone[r.id])) })
              }
            />
            <View className="h-4" />
          </>
        ) : null}
        <PlanPrompt
          title={t('noPlan.title')}
          body={t('noPlan.body')}
          onPress={() => openPlanFlow(profile, '/')}
        />
      </>
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
      {loading ? null : (
        <>
          {day.workout ? (
            <View className="mb-3">
              <DoneCard workout={day.workout} date={day.date} today={today} units={units} />
            </View>
          ) : null}
          {planPart()}
          {/* The list ends 40pt above the tab bar inset; TabScreen adds 24. */}
          <View className="h-4" />
        </>
      )}
    </TabScreen>
  );
}
