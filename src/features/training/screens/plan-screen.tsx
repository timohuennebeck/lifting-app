import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, { useAnimatedRef } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCurrentPlan, usePlanStatus } from '@/shared/data/plans';
import { saveProfile } from '@/shared/data/profile';
import { type RoutineSummary, useRoutines, useWeekDone } from '@/shared/data/routines';
import { useLastDefined } from '@/shared/hooks/use-last-defined';
import { attempt } from '@/shared/lib/async';
import { haptics } from '@/shared/lib/haptics';
import { PLAN_NAME_MAX } from '@/shared/lib/limits';
import { requireUserId } from '@/shared/stores/session-store';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { IconButton } from '@/shared/ui/icon-button';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { afterSheetClose } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';
import { TextInputSheet } from '@/shared/ui/text-input-sheet';

import { AddRoutineButton } from '../components/add-routine-button';
import { PlanOptionsSheet } from '../components/plan-options-sheet';
import { PlanProgress } from '../components/plan-progress';
import { PlanSettings } from '../components/plan-settings';
import { RoutineList } from '../components/routine-list';
import { RoutineMenu } from '../components/routine-menu';
import { SectionTitle } from '../components/section-title';
import { deletePlan, renamePlan } from '../data/plan-mutations';
import { useStartRoutine } from '../hooks/use-start-routine';

/**
 * A plan's page, what's needed most first: where it stands (block, week, workouts done) and
 * whether Today follows it; its routines in order with the next one and those done this week;
 * then its weekly goal and blocks, set up once. "⋯" renames or deletes it.
 */
export function PlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation(['training', 'common']);
  const insets = useSafeAreaInsets();
  const { plan: activePlan, plans, isLoading } = useCurrentPlan();
  const { data: routines = [] } = useRoutines();
  // Deleted on the way out, it still shows while the screen leaves.
  const [leaving, setLeaving] = useState(false);
  const found = plans.find((p) => p.id === id);
  const lastPlan = useLastDefined(found);
  const plan = found ?? (leaving ? (lastPlan ?? undefined) : undefined);
  const status = usePlanStatus(plan);
  const { data: doneThisWeek = {} } = useWeekDone(plan?.id, status?.week);
  const { start, startingId } = useStartRoutine();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [menuFor, setMenuFor] = useState<RoutineSummary | null>(null);

  const header = (
    <ScreenHeader
      icon="chevron-left-thin"
      action={
        <IconButton
          icon="more"
          iconSize={18}
          accessibilityLabel={t('plan.more', { name: plan?.name ?? '' })}
          disabled={!plan}
          onPress={() => setOptionsOpen(true)}
        />
      }
    />
  );

  if (!plan) {
    return (
      <Screen header={header}>
        {!isLoading ? (
          <Text variant="paragraph" tone="subtle" className="px-5 pt-10 text-center">
            {t('plan.notFound')}
          </Text>
        ) : null}
      </Screen>
    );
  }

  const active = plan.id === activePlan?.id;
  const planRoutines = routines.filter((r) => r.planId === plan.id);
  const goal = [
    t('card.perWeek', { count: plan.sessionsPerWeek }),
    plan.blockWeeks ? t('card.block', { build: plan.blockWeeks - 1 }) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const onDelete = async () => {
    setOptionsOpen(false);
    setLeaving(true);
    router.back();
    if (await attempt('Deleting the plan failed', () => deletePlan(plan.id))) haptics.success();
  };

  // Today follows it from now on (also before the profile has synced to the phone).
  const activate = async () => {
    const activated = await attempt('Activating the plan failed', () =>
      saveProfile(requireUserId(), { activePlanId: plan.id }),
    );
    if (activated) haptics.success();
  };

  return (
    <Screen header={header}>
      <Animated.ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        <Text variant="title" className="px-5 pt-5 normal-case">
          {plan.name}
        </Text>

        <Card className="mx-4 mt-5 gap-4">
          <View className="flex-row items-center gap-3">
            <Text variant="caption" tone="subtle" className="min-w-0 flex-1 font-inter-medium">
              {goal}
            </Text>
            {active ? (
              <View className="rounded-full bg-accent/15 px-2.5 py-1">
                <Text variant="caption" tone="accent">
                  {t('plan.active')}
                </Text>
              </View>
            ) : null}
          </View>
          {status ? <PlanProgress plan={plan} status={status} /> : null}
          {!active ? <Button label={t('plan.activate')} size="md" onPress={activate} /> : null}
        </Card>

        <SectionTitle>{t('plan.routines')}</SectionTitle>
        <View className="px-4">
          <RoutineList
            routines={planRoutines}
            scrollRef={scrollRef}
            nextId={status?.nextRoutineId}
            done={doneThisWeek}
            startingId={startingId}
            onStart={start}
            onMore={setMenuFor}
          />
        </View>
        <AddRoutineButton planId={plan.id} />

        <PlanSettings plan={plan} status={status} />
      </Animated.ScrollView>

      <PlanOptionsSheet
        visible={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        name={plan.name}
        routineCount={plan.routineCount}
        onRename={() => {
          setOptionsOpen(false);
          afterSheetClose(() => setRenameOpen(true));
        }}
        onDelete={onDelete}
      />
      <TextInputSheet
        visible={renameOpen}
        onClose={() => setRenameOpen(false)}
        title={t('plan.renameTitle')}
        initialValue={plan.name}
        maxLength={PLAN_NAME_MAX}
        placeholder={t('plan.namePlaceholder')}
        ctaLabel={t('common:actions.save')}
        onSubmit={async (name) => {
          // A failed rename keeps the sheet open with what was typed.
          if (await attempt('Renaming the plan failed', () => renamePlan(plan.id, name))) {
            setRenameOpen(false);
          }
        }}
      />
      <RoutineMenu routine={menuFor} onClose={() => setMenuFor(null)} />
    </Screen>
  );
}
