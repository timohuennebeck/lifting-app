import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { openPlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { TabScreen } from '@/shared/components/tab-screen';
import {
  type PlanStatus,
  type PlanSummary,
  useCurrentPlan,
  usePlanStatus,
  usePlanWeekDone,
} from '@/shared/data/plans';
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
import { formatWeekdayDate } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { ActivePlanCard } from '../components/active-plan-card';
import { PlanPrompt } from '../components/plan-prompt';
import { RECENT_ROUTINES, RoutineRows, useRoutineMeta } from '../components/routine-row';
import { SectionTitle } from '../components/section-title';
import { WeekStrip } from '../components/week-strip';
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
 * Training, the first tab: the week with its workouts (a finished one opens its summary), the
 * plan it follows with where it stands and its routines, then the routines outside a plan
 * (Einzeltrainings). Without a plan, or with an empty one, a way to make or fill it.
 */
export function TrainingScreen() {
  const { t, i18n } = useTranslation(['training', 'muscles']);
  // The tab stays mounted: the day comes from a clock so it moves on overnight.
  const today = new Date(useToday());
  const { data: active } = useActiveWorkout();
  const { days, isLoading: weekLoading } = useWeekWorkouts(today);
  const { plan, profile, isLoading: planLoading } = useCurrentPlan();
  const status = usePlanStatus(plan);
  const { data: doneThisWeek } = usePlanWeekDone(plan?.id, status?.week);
  const { data: routines = [], isLoading: routinesLoading } = useRoutines();
  const { data: lastDone = {}, isLoading: lastDoneLoading } = useLastDone();
  const meta = useRoutineMeta();
  // One starter for the whole screen, so two starts can't race.
  const { start, startingId } = useStartRoutine();

  const planRoutines = plan ? routines.filter((r) => r.planId === plan.id) : [];
  const library = routines.filter((r) => r.planId === null);
  const singles = recentFirst(library, lastDone, i18n.language).slice(0, RECENT_ROUTINES);
  // Nothing shows until the week, the plan and what was done are known, so no card moves down
  // once the rows above it arrive.
  const loading =
    weekLoading || planLoading || routinesLoading || lastDoneLoading || (!!plan && !status);
  // A plan routine's time and exercises, with the muscle it works most in neon above.
  const planMeta = (r: RoutineSummary) =>
    r.exerciseCount
      ? `${t('list.minutes', { count: r.estimatedMinutes })} · ${t('overview.exercises', { count: r.exerciseCount })}`
      : t('overview.noExercises');
  const planFocus = (r: RoutineSummary) => {
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

  // The plan card shows once the plan has routines.
  let card: { plan: PlanSummary; status: PlanStatus } | undefined;
  if (plan && status && planRoutines.length) card = { plan, status };
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
      onPress={() => router.push({ pathname: '/routine/new', params: { planId: plan.id } })}
    />
  ) : null;

  return (
    <TabScreen
      pinned={
        <View>
          {resume}
          <WeekStrip
            days={days}
            today={today}
            onOpen={(id) => router.push(`/workout/summary/${id}`)}
          />
        </View>
      }
    >
      {loading ? null : (
        <>
          {card ? (
            <>
              <SectionTitle first>{t('home.activePlan')}</SectionTitle>
              <ActivePlanCard
                plan={card.plan}
                status={card.status}
                routines={planRoutines}
                goal={profile?.goal}
              />
              <View className="h-2" />
              <RoutineRows
                routines={planRoutines}
                meta={planMeta}
                focus={planFocus}
                done={(r) => !!doneThisWeek?.has(r.id)}
                startingId={startingId}
                onStart={start}
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
