import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, { useAnimatedRef } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCurrentPlan, usePlanStatus } from '@/shared/data/plans';
import { saveProfile } from '@/shared/data/profile';
import { type RoutineSummary, useRoutines } from '@/shared/data/routines';
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
import { PlanSettings } from '../components/plan-settings';
import { RoutineList } from '../components/routine-list';
import { RoutineMenu } from '../components/routine-menu';
import { SectionTitle } from '../components/section-title';
import { SessionProgress } from '../components/session-progress';
import { deletePlan, renamePlan } from '../data/plan-mutations';
import { usePlanProgressLabels } from '../hooks/use-plan-week-label';
import { useStartRoutine } from '../hooks/use-start-routine';

/**
 * A plan's page: where it stands (week, block, workouts done), whether Today follows it, its
 * weekly goal and blocks, and its routines in order. "⋯" renames or deletes it.
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
  const labels = usePlanProgressLabels(plan, status);
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
            <Text variant="headline" className="min-w-0 flex-1" numberOfLines={1}>
              {labels.week}
            </Text>
            {active ? (
              <View className="rounded-full bg-accent/15 px-2.5 py-1">
                <Text variant="caption" tone="accent">
                  {t('plan.active')}
                </Text>
              </View>
            ) : null}
          </View>
          <View className="gap-2.5">
            <Text variant="caption" tone="subtle" className="font-inter-medium">
              {labels.sessions}
            </Text>
            <SessionProgress done={status?.done ?? 0} total={plan.sessionsPerWeek} />
          </View>
          {!active ? <Button label={t('plan.activate')} size="md" onPress={activate} /> : null}
        </Card>

        <PlanSettings plan={plan} status={status} />

        <SectionTitle>{t('plan.routines')}</SectionTitle>
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
