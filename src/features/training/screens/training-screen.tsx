import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, { useAnimatedRef } from 'react-native-reanimated';

import { openPlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { TabScreen } from '@/shared/components/tab-screen';
import {
  type PlanStatus,
  type PlanSummary,
  useCurrentPlan,
  usePlanStatus,
} from '@/shared/data/plans';
import { type RoutineSummary, useRoutines } from '@/shared/data/routines';
import { colors } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Icon } from '@/shared/ui/icon';
import { IconButton } from '@/shared/ui/icon-button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { afterSheetClose } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

import { AddRoutineButton } from '../components/add-routine-button';
import { CreateSheet } from '../components/create-sheet';
import { RoutineList } from '../components/routine-list';
import { RoutineMenu } from '../components/routine-menu';
import { SectionTitle } from '../components/section-title';
import { SessionProgress } from '../components/session-progress';
import { usePlanProgressLabels } from '../hooks/use-plan-week-label';
import { useStartRoutine } from '../hooks/use-start-routine';

interface PlanCardProps {
  plan: PlanSummary;
  status: PlanStatus | undefined;
}

/** The plan Today follows: its week and how much of it is done; opens the plan. */
function PlanCard({ plan, status }: PlanCardProps) {
  const { week, sessions } = usePlanProgressLabels(plan, status);
  const progress = status ? `${week} · ${sessions}` : '';
  return (
    <PressableScale
      haptic="tap"
      activeScale={0.98}
      accessibilityRole="button"
      accessibilityLabel={`${plan.name}, ${progress}`}
      onPress={() => router.push(`/plan/${plan.id}`)}
      className="mx-4 mb-2 gap-3.5 rounded-[22px] bg-surface p-4"
    >
      <View className="flex-row items-center gap-3">
        <View className="min-w-0 flex-1 gap-1">
          <Text variant="headline" numberOfLines={1}>
            {plan.name}
          </Text>
          <Text variant="caption" tone="subtle" className="font-inter-medium">
            {progress}
          </Text>
        </View>
        <Icon name="chevron-right" size={7} color={colors.dim} />
      </View>
      <SessionProgress done={status?.done ?? 0} total={plan.sessionsPerWeek} />
    </PressableScale>
  );
}

interface OtherPlanRowProps {
  plan: PlanSummary;
}

/** One of the plans Today doesn't follow, opening its page. */
function OtherPlanRow({ plan }: OtherPlanRowProps) {
  const { t } = useTranslation('training');
  const meta = `${t('plan.routineCount', { count: plan.routineCount })} · ${t('plan.perWeekShort', { count: plan.sessionsPerWeek })}`;
  return (
    <PressableScale
      haptic="tap"
      activeScale={0.98}
      accessibilityRole="button"
      accessibilityLabel={`${plan.name}, ${meta}`}
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
      <Icon name="chevron-right" size={7} color={colors.dim} />
    </PressableScale>
  );
}

/**
 * Training tab (01·V·A): the plan Today follows with its routines in order and what's next, the
 * other plans, and Meine Trainings, the routines outside a plan. "+" makes a routine or a plan.
 */
export function TrainingScreen() {
  const { t } = useTranslation('training');
  const { data: routines = [], isLoading: routinesLoading } = useRoutines();
  const { plan, plans, profile, isLoading: planLoading } = useCurrentPlan();
  const status = usePlanStatus(plan);
  const { start, startingId } = useStartRoutine();
  const [createOpen, setCreateOpen] = useState(false);
  const [menuFor, setMenuFor] = useState<RoutineSummary | null>(null);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  const planRoutines = plan ? routines.filter((r) => r.planId === plan.id) : [];
  const library = routines.filter((r) => r.planId === null);
  const otherPlans = plans.filter((p) => p.id !== plan?.id);
  const createPlan = () => openPlanFlow(profile, '/training', plan?.sessionsPerWeek);

  return (
    <TabScreen
      scrollRef={scrollRef}
      headerActions={
        <IconButton
          icon="plus"
          iconSize={14}
          accessibilityLabel={t('header.create')}
          onPress={() => setCreateOpen(true)}
        />
      }
    >
      <Text variant="title" className="px-5 pt-8 normal-case">
        {t('list.title')}
      </Text>

      <SectionTitle>{t('list.myPlan')}</SectionTitle>
      {plan ? (
        <>
          <PlanCard plan={plan} status={status} />
          <View className="px-4">
            <RoutineList
              routines={planRoutines}
              scrollRef={scrollRef}
              nextId={status?.nextRoutineId}
              startingId={startingId}
              onStart={start}
              onMore={setMenuFor}
            />
          </View>
          <AddRoutineButton planId={plan.id} />
        </>
      ) : !planLoading ? (
        <Card className="mx-4 items-center gap-4 py-7">
          <View className="items-center gap-2">
            <Text variant="headline" className="text-center">
              {t('list.noPlan')}
            </Text>
            <Text variant="paragraph" tone="subtle" className="text-center">
              {t('list.noPlanHint')}
            </Text>
          </View>
          <Button
            label={t('create.createPlan')}
            icon="plus"
            size="md"
            variant="secondary"
            onPress={createPlan}
          />
        </Card>
      ) : null}

      {otherPlans.length ? (
        <>
          <SectionTitle>{t('list.otherPlans')}</SectionTitle>
          <View className="gap-2 px-4">
            {otherPlans.map((p) => (
              <OtherPlanRow key={p.id} plan={p} />
            ))}
          </View>
        </>
      ) : null}

      <SectionTitle>{t('list.library')}</SectionTitle>
      {library.length ? (
        <View className="px-4">
          <RoutineList
            routines={library}
            scrollRef={scrollRef}
            startingId={startingId}
            onStart={start}
            onMore={setMenuFor}
          />
        </View>
      ) : !routinesLoading ? (
        <Text variant="paragraph" tone="subtle" className="px-5">
          {t('list.libraryEmpty')}
        </Text>
      ) : null}
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
      <RoutineMenu routine={menuFor} onClose={() => setMenuFor(null)} />
    </TabScreen>
  );
}
