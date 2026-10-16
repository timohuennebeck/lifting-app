import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { openPlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { RoutineRow, useRoutineMeta } from '@/features/training/components/routine-row';
import { SectionTitle } from '@/features/training/components/section-title';
import { useStartRoutine } from '@/features/training/hooks/use-start-routine';
import { TabScreen } from '@/shared/components/tab-screen';
import { useCurrentPlan, usePlanStatus } from '@/shared/data/plans';
import {
  type DoneDates,
  type RoutineSummary,
  useLastDone,
  useRoutines,
  useWeekDone,
} from '@/shared/data/routines';
import { useActiveWorkout } from '@/shared/data/workouts';
import { useToday } from '@/shared/hooks/use-today';
import { cn } from '@/shared/lib/cn';
import { mondayIndex } from '@/shared/lib/date';
import { formatDate, formatWeekdayDate } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { PlanCard } from '../components/plan-card';
import { PlanPrompt } from '../components/plan-prompt';
import { WeekStrip } from '../components/week-strip';
import { useWeekWorkouts } from '../hooks/use-week-workouts';

/** Einzeltrainings shown here, the ones done most recently first; "Alle anzeigen" has the rest. */
const RECENT = 3;

/** Routines done most recently first, then the others A–Z. */
function recentFirst(routines: RoutineSummary[], lastDone: DoneDates, language: string) {
  return [...routines].sort(
    (a, b) =>
      (lastDone[b.id] ?? '').localeCompare(lastDone[a.id] ?? '') ||
      a.name.localeCompare(b.name, language),
  );
}

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
  startingId: string | null;
  onStart: (routine: RoutineSummary) => void;
}

/** Routine cards with quick start; an empty routine opens instead, to add exercises. */
function RoutineRows({
  routines,
  done = {},
  doneLabel,
  meta,
  startingId,
  onStart,
}: RoutineRowsProps) {
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
              routine.exerciseCount ? onStart(routine) : router.push(`/routine/${routine.id}`)
            }
          />
        );
      })}
    </View>
  );
}

/**
 * Training, the first tab: the week with its workouts and the picked day's workout once done,
 * then the plan it follows with where it stands, the routine that comes next and its other
 * routines; then the routines outside a plan (Einzeltrainings) and the other plans. Without a
 * plan, or with an empty one, a way to make or fill it.
 */
export function TodayScreen() {
  const { t, i18n } = useTranslation(['today', 'training']);
  // The tab stays mounted: the day comes from a clock so it moves on overnight, and a picked
  // day only counts on the day it was picked.
  const dayKey = useToday();
  const today = new Date(dayKey);
  const [pick, setPick] = useState<DayPick | null>(null);
  const selected = pick?.day === dayKey ? pick.index : mondayIndex(today);
  const { data: active } = useActiveWorkout();
  const { days, isLoading: weekLoading } = useWeekWorkouts(today);
  const day = days[selected];
  // A day with a finished workout opens its summary; another picks it, for marking done.
  const select = (index: number) => {
    const done = days[index].workout;
    if (done) router.push(`/workout/summary/${done.id}`);
    else setPick({ day: dayKey, index });
  };
  const { plan, profile, isLoading: planLoading } = useCurrentPlan();
  const status = usePlanStatus(plan);
  const { data: routines = [], isLoading: routinesLoading } = useRoutines();
  const { data: doneThisWeek = {}, isLoading: doneLoading } = useWeekDone(plan?.id, status?.week);
  const { data: lastDone = {}, isLoading: lastDoneLoading } = useLastDone();
  const meta = useRoutineMeta();
  // One starter for the whole screen, so two starts can't race.
  const { start, startingId } = useStartRoutine();

  const planRoutines = plan ? routines.filter((r) => r.planId === plan.id) : [];
  const next = planRoutines.find((r) => r.id === status?.nextRoutineId);
  const rest = planRoutines.filter((r) => r !== next);
  const library = routines.filter((r) => r.planId === null);
  const singles = recentFirst(library, lastDone, i18n.language).slice(0, RECENT);
  // Nothing shows until the day, the plan and what was done are known, so no card flashes in
  // the wrong state or moves down once the rows above it arrive.
  const loading =
    weekLoading ||
    planLoading ||
    routinesLoading ||
    lastDoneLoading ||
    (!!plan && (!status || doneLoading));

  // A running workout is one tap away; new ones start from the tab bar's "+".
  const resume = active ? (
    <PressableScale
      haptic="press"
      onPress={() => router.push(`/workout/${active.id}`)}
      className="mx-4 mt-2 mb-0.5 h-10 flex-row items-center gap-1.75 self-start rounded-full bg-accent px-3.75"
    >
      <Icon name="play" size={12} color={colors.onAccent} />
      <Text variant="caption" tone="onAccent" className="text-sm">
        {t('resumeActive', { name: active.name })}
      </Text>
    </PressableScale>
  ) : null;

  // The plan's status once it has routines: the plan card shows.
  const followed = planRoutines.length ? status : undefined;
  // Without a plan, or with an empty one, the way to make or fill it fills the rest of the page.
  const prompt = !plan ? (
    <PlanPrompt
      title={t('noPlan.title')}
      body={t('noPlan.body')}
      onPress={() => openPlanFlow(profile)}
    />
  ) : !planRoutines.length ? (
    <PlanPrompt
      title={t('emptyPlan.title')}
      body={t('emptyPlan.body')}
      onPress={() => router.push({ pathname: '/routine/new', params: { planId: plan.id } })}
    />
  ) : null;

  return (
    <TabScreen
      pinned={
        <View>
          {resume}
          <WeekStrip days={days} today={today} selected={selected} onSelect={select} />
        </View>
      }
    >
      {loading ? null : (
        <>
          {followed ? (
            <>
              <PlanCard
                plan={plan}
                status={followed}
                next={next}
                date={day.date}
                today={today}
                canMarkDone={!day.workout}
                activeWorkoutId={active?.id ?? null}
                startingId={startingId}
                onStart={start}
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
                    startingId={startingId}
                    onStart={start}
                  />
                </>
              ) : null}
            </>
          ) : null}
          {singles.length ? (
            <>
              <SectionTitle
                action={
                  library.length > RECENT
                    ? { label: t('training:home.showAll'), onPress: () => router.push('/routines') }
                    : undefined
                }
              >
                {t('training:home.single')}
              </SectionTitle>
              <RoutineRows
                routines={singles}
                meta={(r) =>
                  lastDone[r.id]
                    ? t('training:all.lastDone', {
                        date: formatWeekdayDate(new Date(lastDone[r.id])),
                      })
                    : meta(r)
                }
                startingId={startingId}
                onStart={start}
              />
            </>
          ) : null}
          {prompt ? (
            <View className={cn('flex-1', singles.length > 0 && 'pt-8')}>{prompt}</View>
          ) : null}
          {/* The list ends 40pt above the tab bar inset; TabScreen adds 24. */}
          <View className="h-4" />
        </>
      )}
    </TabScreen>
  );
}
