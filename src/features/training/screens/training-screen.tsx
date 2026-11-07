import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, { useAnimatedRef } from 'react-native-reanimated';

import { AskCoachCard } from '@/features/coach/components/ask-coach-card';
import { HomeWeightBoxes } from '@/features/weight/components/home/home-weight-boxes';
import { openPlanEditor, openPlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { TabScreen } from '@/shared/components/tab-screen';
import { useCurrentPlan, usePlanStatus, usePlanWeekDone } from '@/shared/data/plans';
import { muscleShares } from '@/shared/data/muscles';
import {
  type DoneDates,
  type RoutineSummary,
  useLastDone,
  useRoutines,
} from '@/shared/data/routines';
import { useActiveWorkout } from '@/shared/data/workouts';
import { useToday } from '@/shared/hooks/use-today';
import { cn } from '@/shared/lib/cn';
import { formatShortDate, formatTime, formatWeekdayDate } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { useSplashStore } from '@/shared/stores/splash-store';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { PlanPrompt } from '../components/plan-prompt';
import { RECENT_ROUTINES, RoutineRows, useRoutineMeta } from '../components/routine-row';
import { SectionTitle } from '../components/section-title';
import { WeekStrip } from '../components/week-strip';
import { reorderPlanRoutine } from '../data/routine-mutations';
import { useCreateRoutine } from '../hooks/use-create-routine';
import { useStartRoutine } from '../hooks/use-start-routine';
import { useWeekWorkouts } from '../hooks/use-week-workouts';

/** Routines done most recently first, then the others A–Z. */
function recentFirst(routines: RoutineSummary[], lastDone: DoneDates, language: string) {
  return [...routines].sort(
    (a, b) =>
      (lastDone[b.id] ?? '').localeCompare(lastDone[a.id] ?? '') ||
      a.name.localeCompare(b.name, language),
  );
}

/**
 * Training, the first tab: the week with its workouts (a finished one opens its summary; a swipe
 * shows earlier and later weeks), the plan's routines (hold one to move it, "Bearbeiten" opens the
 * plan to edit), then the routines outside a plan (Einzeltrainings). Without a plan, or with an
 * empty one, a way to make or fill it.
 */
export function TrainingScreen() {
  const { t, i18n } = useTranslation(['training', 'muscles']);
  // The tab stays mounted: the day comes from a clock so it moves on overnight.
  const today = new Date(useToday());
  const { data: active, isLoading: activeLoading } = useActiveWorkout();
  // This week's workouts, which the strip opens on (the same query, so it is loaded once).
  const { isLoading: weekLoading } = useWeekWorkouts(today);
  const { plan, profile, isLoading: planLoading } = useCurrentPlan();
  const status = usePlanStatus(plan);
  const { data: finishedThisWeek, isLoading: weekDoneLoading } = usePlanWeekDone(
    plan?.id,
    status?.week,
  );
  const { data: routines = [], isLoading: routinesLoading } = useRoutines();
  const { data: lastDone = {}, isLoading: lastDoneLoading } = useLastDone();
  const meta = useRoutineMeta();
  // One starter for the whole screen, so two starts can't race.
  const { start, startingId } = useStartRoutine();
  const { create: createRoutine } = useCreateRoutine();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  const planRoutines = plan ? routines.filter((r) => r.planId === plan.id) : [];
  const library = routines.filter((r) => r.planId === null);
  const singles = recentFirst(library, lastDone, i18n.language).slice(0, RECENT_ROUTINES);
  // Nothing shows until the week, the plan and what was done are known, so no card moves down
  // once the rows above it arrive.
  const loading =
    activeLoading ||
    weekLoading ||
    planLoading ||
    weekDoneLoading ||
    routinesLoading ||
    lastDoneLoading ||
    (!!plan && !status);
  // The tab appears all at once, under the splash screen on launch; after that the week strip and
  // Kai stay when the rows below them reload.
  const [shown, setShown] = useState(false);
  if (!shown && !loading) setShown(true);
  const setHomeReady = useSplashStore((s) => s.setHomeReady);
  // A frame later, so the page is on screen under the splash screen when that goes.
  useEffect(() => {
    if (!shown) return;
    const frame = requestAnimationFrame(() => setHomeReady());
    return () => cancelAnimationFrame(frame);
  }, [shown, setHomeReady]);
  // The first routine with exercises not done this plan week comes next.
  const nextId = planRoutines.find((r) => r.exerciseCount && !finishedThisWeek?.has(r.id))?.id;
  // A plan routine's time and exercises, with the muscle it works most in neon above; done this
  // week, "Erledigt" in neon and when.
  const planMeta = (r: RoutineSummary) => {
    const finishedAt = finishedThisWeek?.get(r.id);
    if (finishedAt) {
      const date = new Date(finishedAt);
      return t('list.doneAt', { date: formatShortDate(date), time: formatTime(date) });
    }
    return r.exerciseCount
      ? `${t('list.minutes', { count: r.estimatedMinutes })} · ${t('overview.exercises', { count: r.exerciseCount })}`
      : t('overview.noExercises');
  };
  const planFocus = (r: RoutineSummary) => {
    if (finishedThisWeek?.has(r.id)) return t('list.done');
    const top = muscleShares(r.items)[0];
    return top ? `${t(`muscles:names.${top.muscle}`)} ${top.percent} %` : undefined;
  };

  // A running workout is one tap away; new ones start from the tab bar's "+".
  const resume = active ? (
    <PressableScale
      haptic="press"
      onPress={() => router.push(`/workout/${active.id}`)}
      className="mx-4 mt-2 mb-0.5 h-10 flex-row items-center gap-1.75 self-start rounded-full bg-accent px-3.75"
    >
      <Icon name="play" size={12} color={colors.onAccent} />
      <Text variant="caption" tone="onAccent" className="text-sm">
        {t('home.resumeActive', { name: active.name })}
      </Text>
    </PressableScale>
  ) : null;

  // The plan's routines show once it has some.
  const planShown = plan && status && planRoutines.length ? { plan, status } : undefined;
  // Without a plan, or with an empty one, the way to make or fill it fills the rest of the page.
  const prompt = !plan ? (
    <PlanPrompt
      title={t('home.noPlan.title')}
      body={t('home.noPlan.body')}
      onPress={() => openPlanFlow(profile)}
    />
  ) : !planRoutines.length ? (
    <PlanPrompt
      title={t('home.emptyPlan.title')}
      body={t('home.emptyPlan.body')}
      onPress={() => void createRoutine(plan.id)}
    />
  ) : null;

  return (
    <TabScreen
      scrollRef={scrollRef}
      pinned={
        shown ? (
          <View>
            {resume}
            <WeekStrip today={today} onOpen={(id) => router.push(`/workout/summary/${id}`)} />
          </View>
        ) : null
      }
    >
      {shown ? <AskCoachCard className="mx-4 mt-3 mb-3" /> : null}
      {shown ? <HomeWeightBoxes className="mx-4 mb-3" /> : null}
      {loading ? null : (
        <>
          {planShown ? (
            <>
              <SectionTitle
                first
                edit={{
                  label: t('card.edit'),
                  onPress: () => void openPlanEditor(planShown.plan.id),
                }}
              >
                {t('home.planRoutines', {
                  week: planShown.status.deload
                    ? t('plan.deload')
                    : t('plan.block', { n: planShown.status.blockWeek ?? planShown.status.week }),
                })}
              </SectionTitle>
              <RoutineRows
                routines={planRoutines}
                meta={planMeta}
                focus={planFocus}
                done={(r) => !!finishedThisWeek?.has(r.id)}
                nextId={nextId}
                startingId={startingId}
                onStart={start}
                onMove={(id, to) => void reorderPlanRoutine(id, to)}
                scrollRef={scrollRef}
              />
            </>
          ) : null}
          {singles.length ? (
            <>
              <SectionTitle
                action={
                  library.length > RECENT_ROUTINES
                    ? { label: t('home.showAll'), onPress: () => router.push('/routines') }
                    : undefined
                }
              >
                {t('home.single')}
              </SectionTitle>
              <RoutineRows
                routines={singles}
                meta={(r) =>
                  lastDone[r.id]
                    ? t('all.lastDone', {
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
