import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { openPlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { TabScreen } from '@/shared/components/tab-screen';
import { type PlanSummary, useCurrentPlan } from '@/shared/data/plans';
import { type RoutineSummary, useLastDone, useRoutines } from '@/shared/data/routines';
import { formatWeekdayDate } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { IconButton } from '@/shared/ui/icon-button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { afterSheetClose } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

import { AddRoutineButton } from '../components/add-routine-button';
import { CreateSheet } from '../components/create-sheet';
import { RoutineRow, useRoutineMeta } from '../components/routine-row';
import { SectionTitle } from '../components/section-title';
import { useStartRoutine } from '../hooks/use-start-routine';

/** Routines done most recently, shown above the full list once it is longer than this. */
const RECENT = 3;

interface PlanRowProps {
  plan: PlanSummary;
  active: boolean;
}

/** A plan: its name, routines and weekly goal, marked when Today follows it; opens its page. */
function PlanRow({ plan, active }: PlanRowProps) {
  const { t } = useTranslation('training');
  const meta = `${t('plan.routineCount', { count: plan.routineCount })} · ${t('plan.perWeekShort', { count: plan.sessionsPerWeek })}`;
  return (
    <PressableScale
      haptic="tap"
      activeScale={0.98}
      accessibilityRole="button"
      accessibilityLabel={[plan.name, active ? t('plan.active') : null, meta]
        .filter(Boolean)
        .join(', ')}
      onPress={() => router.push(`/plan/${plan.id}`)}
      className="h-17 flex-row items-center gap-3 rounded-[22px] bg-surface px-4"
    >
      <View className="min-w-0 flex-1 gap-1">
        <Text variant="bodyStrong" numberOfLines={1}>
          {plan.name}
        </Text>
        <Text variant="caption" tone="subtle" className="font-inter-medium">
          {meta}
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
    </PressableScale>
  );
}

/**
 * Training tab: everything the user built. Their plans (the one Today follows marked), then the
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
        <View className="gap-2 px-4">
          {plans.map((p) => (
            <PlanRow key={p.id} plan={p} active={p.id === plan?.id} />
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
