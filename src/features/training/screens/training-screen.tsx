import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { openPlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { TabScreen } from '@/shared/components/tab-screen';
import { muscleShares } from '@/shared/data/muscles';
import { type PlanSummary, useCurrentPlan, usePlanStatus } from '@/shared/data/plans';
import { type RoutineSummary, useLastDone, useRoutines } from '@/shared/data/routines';
import { formatWeekdayDate } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { MuscleCircle } from '@/shared/ui/muscle-map';
import { IconButton } from '@/shared/ui/icon-button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { afterSheetClose } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

import { AddRoutineButton } from '../components/add-routine-button';
import { CreateSheet } from '../components/create-sheet';
import { PlanProgress } from '../components/plan-progress';
import { RoutineRow, useRoutineMeta } from '../components/routine-row';
import { SectionTitle } from '../components/section-title';
import { useStartRoutine } from '../hooks/use-start-routine';

/** Routines done most recently, shown above the full list once it is longer than this. */
const RECENT = 3;

interface PlanCardProps {
  plan: PlanSummary;
  /** Today follows it. */
  active: boolean;
  /** Its routines, in their order. */
  routines: RoutineSummary[];
}

/**
 * A plan as a card: its name and goal, where it stands, and its routines as chips with the
 * muscle each works most (the one the coach recommends next in neon, for the active plan).
 * Opens the plan's page.
 */
function PlanCard({ plan, active, routines }: PlanCardProps) {
  const { t } = useTranslation('training');
  const status = usePlanStatus(plan);
  const goal = [
    t('card.perWeek', { count: plan.sessionsPerWeek }),
    plan.blockWeeks ? t('card.block', { build: plan.blockWeeks - 1 }) : null,
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <PressableScale
      haptic="tap"
      activeScale={0.98}
      accessibilityRole="button"
      accessibilityLabel={[plan.name, active ? t('plan.active') : null, goal]
        .filter(Boolean)
        .join(', ')}
      onPress={() => router.push(`/plan/${plan.id}`)}
      className="gap-4 rounded-[22px] bg-surface p-4"
    >
      <View className="flex-row items-center gap-3">
        <View className="min-w-0 flex-1 gap-1">
          <Text variant="headline" numberOfLines={1}>
            {plan.name}
          </Text>
          <Text variant="caption" tone="subtle" className="font-inter-medium">
            {goal}
          </Text>
        </View>
        {active ? (
          <View className="rounded-full bg-accent/15 px-2.5 py-1">
            <Text variant="caption" tone="accent">
              {t('plan.active')}
            </Text>
          </View>
        ) : null}
        <Icon name="chevron-right" size={7} color={colors.dim} />
      </View>
      {status ? <PlanProgress plan={plan} status={status} /> : null}
      {routines.length ? (
        <View className="flex-row flex-wrap gap-2">
          {routines.map((routine) => {
            const top = muscleShares(routine.items)[0];
            const next = active && routine.id === status?.nextRoutineId;
            return (
              <View
                key={routine.id}
                className="h-9 flex-row items-center gap-2 rounded-full bg-elevated pr-3.5 pl-1"
              >
                <MuscleCircle
                  muscle={top?.muscle ?? null}
                  accent={next ? colors.accent : colors.fg2}
                  className="size-7 bg-control"
                />
                <Text variant="caption" numberOfLines={1} className="max-w-36 text-sm">
                  {routine.name}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}
    </PressableScale>
  );
}

/**
 * Training tab: everything the user built. Their plans as cards (the one Today follows first), then the
 * routines outside a plan, the ones done most recently first, then all of them A–Z. "+" makes a
 * routine or a plan; exercises are in the search.
 */
export function TrainingScreen() {
  const { t, i18n } = useTranslation('training');
  const { plan, plans, profile, isLoading: plansLoading } = useCurrentPlan();
  const { data: routines = [], isLoading } = useRoutines();
  const { data: lastDone = {} } = useLastDone();
  const { start, startingId } = useStartRoutine();
  const meta = useRoutineMeta();
  const [createOpen, setCreateOpen] = useState(false);
  const createPlan = () => openPlanFlow(profile, '/training', plan?.sessionsPerWeek);

  const library = routines.filter((r) => r.planId === null);
  const all = [...library].sort((a, b) => a.name.localeCompare(b.name, i18n.language));
  const recent =
    library.length > RECENT
      ? library
          .filter((r) => lastDone[r.id])
          .sort((a, b) => lastDone[b.id].localeCompare(lastDone[a.id]))
          .slice(0, RECENT)
      : [];

  const row = (routine: RoutineSummary, line: string) => (
    <RoutineRow
      key={routine.id}
      name={routine.name}
      items={routine.items}
      meta={line}
      starting={startingId === routine.id}
      onPress={() => router.push(`/routine/${routine.id}`)}
      // An empty routine has nothing to start: play opens it to add exercises.
      onStart={() =>
        routine.exerciseCount ? start(routine) : router.push(`/routine/${routine.id}`)
      }
    />
  );

  return (
    <TabScreen
      headerActions={
        <IconButton
          icon="plus"
          iconSize={14}
          accessibilityLabel={t('header.create')}
          onPress={() => setCreateOpen(true)}
        />
      }
    >
      <SectionTitle>{t('list.plans')}</SectionTitle>
      {plans.length ? (
        <View className="gap-2.5 px-4">
          {/* The one Today follows first. */}
          {[...plans]
            .sort((a, b) => Number(b.id === plan?.id) - Number(a.id === plan?.id))
            .map((p) => (
              <PlanCard
                key={p.id}
                plan={p}
                active={p.id === plan?.id}
                routines={routines.filter((r) => r.planId === p.id)}
              />
            ))}
        </View>
      ) : !plansLoading ? (
        <View className="mx-4 items-start gap-3 rounded-[22px] bg-surface p-4">
          <View className="gap-1">
            <Text variant="bodyStrong">{t('list.noPlan')}</Text>
            <Text variant="caption" tone="subtle" className="font-inter-medium">
              {t('list.noPlanHint')}
            </Text>
          </View>
          <Button
            label={t('create.createPlan')}
            icon="plus"
            size="sm"
            variant="secondary"
            onPress={createPlan}
          />
        </View>
      ) : null}

      {recent.length ? (
        <>
          <SectionTitle>{t('all.recent')}</SectionTitle>
          <View className="gap-2 px-4">
            {recent.map((routine) =>
              row(
                routine,
                t('all.lastDone', { date: formatWeekdayDate(new Date(lastDone[routine.id])) }),
              ),
            )}
          </View>
        </>
      ) : null}

      <SectionTitle>{t('list.library')}</SectionTitle>
      {library.length ? (
        <View className="gap-2 px-4">{all.map((routine) => row(routine, meta(routine)))}</View>
      ) : !isLoading ? (
        <Text variant="paragraph" tone="subtle" className="px-5">
          {t('list.libraryEmpty')}
        </Text>
      ) : null}
      <AddRoutineButton />
      {/* The list ends 40pt above the tab bar inset; TabScreen adds 24. */}
      <View className="h-4" />

      <CreateSheet
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreateRoutine={() => {
          setCreateOpen(false);
          afterSheetClose(() => router.push('/routine/new'));
        }}
        onCreatePlan={() => {
          setCreateOpen(false);
          afterSheetClose(createPlan);
        }}
      />
    </TabScreen>
  );
}
