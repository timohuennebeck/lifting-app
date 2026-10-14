import { router, useLocalSearchParams } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, { useAnimatedRef } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BLOCK_OPTIONS,
  currentPlanId,
  MAX_SESSIONS_PER_WEEK,
  usePlanStatus,
  usePlans,
} from '@/shared/data/plans';
import { useProfile } from '@/shared/data/profile';
import { type RoutineSummary, useRoutines } from '@/shared/data/routines';
import { haptics } from '@/shared/lib/haptics';
import { PLAN_NAME_MAX } from '@/shared/lib/limits';
import { requireUserId } from '@/shared/stores/session-store';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { CompactStepper } from '@/shared/ui/compact-stepper';
import { IconButton } from '@/shared/ui/icon-button';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { SegmentedControl } from '@/shared/ui/segmented-control';
import { afterSheetClose } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';
import { TextInputSheet } from '@/shared/ui/text-input-sheet';

import { PlanOptionsSheet } from '../components/plan-options-sheet';
import { RoutineList } from '../components/routine-list';
import { RoutineMenu } from '../components/routine-menu';
import { SectionTitle } from '../components/section-title';
import { SessionProgress } from '../components/session-progress';
import {
  activatePlan,
  deletePlan,
  deloadNow,
  renamePlan,
  restartBlock,
  setBlockWeeks,
  setSessionsPerWeek,
} from '../data/plan-mutations';
import { usePlanWeekLabel } from '../hooks/use-plan-week-label';
import { useStartRoutine } from '../hooks/use-start-routine';

/** A setting of the plan: overline, the control on a card, a line on what it does. */
function Setting({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <>
      <SectionTitle>{title}</SectionTitle>
      <View className="mx-4 rounded-[22px] bg-surface px-4 py-3">{children}</View>
      <Text variant="caption" tone="subtle" className="px-5 pt-2 font-inter">
        {hint}
      </Text>
    </>
  );
}

/**
 * A plan's page: where it stands (week, block, workouts done), whether Today follows it, its
 * weekly goal and blocks, and its routines in order. "⋯" renames or deletes it.
 */
export function PlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation(['training', 'common']);
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const { data: plans = [], isLoading } = usePlans();
  const { data: routines = [] } = useRoutines();
  const plan = plans.find((p) => p.id === id);
  const status = usePlanStatus(plan);
  const weekLabel = usePlanWeekLabel();
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

  const active = plan.id === currentPlanId(profile?.activePlanId, plans);
  // Settings that start a block count from the week the plan is in now.
  const week = status?.week ?? 1;
  const planRoutines = routines.filter((r) => r.planId === plan.id);
  const blockOptions = [
    { value: 0, label: t('plan.blockOff') },
    ...BLOCK_OPTIONS.map((weeks) => ({
      value: weeks,
      label: t('plan.blockOption', { build: weeks - 1 }),
    })),
  ];

  const onDelete = async () => {
    setOptionsOpen(false);
    router.back();
    try {
      await deletePlan(plan.id);
    } catch (error) {
      console.warn('Deleting the plan failed', error);
      haptics.error();
    }
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
              {status ? weekLabel(plan, status) : ''}
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
              {t('plan.sessions', { done: status?.done ?? 0, total: plan.sessionsPerWeek })}
            </Text>
            <SessionProgress done={status?.done ?? 0} total={plan.sessionsPerWeek} />
          </View>
          {!active ? (
            <Button
              label={t('plan.activate')}
              size="md"
              onPress={async () => {
                await activatePlan(requireUserId(), plan.id);
                haptics.success();
              }}
            />
          ) : null}
        </Card>

        <Setting title={t('plan.perWeek')} hint={t('plan.perWeekHint')}>
          <CompactStepper
            value={plan.sessionsPerWeek}
            min={1}
            max={MAX_SESSIONS_PER_WEEK}
            onChange={(count) => void setSessionsPerWeek(plan.id, count)}
          />
        </Setting>

        <Setting title={t('plan.blocks')} hint={t('plan.blocksHint')}>
          <SegmentedControl
            options={blockOptions}
            value={plan.blockWeeks ?? 0}
            onChange={(weeks) => void setBlockWeeks(plan.id, weeks || null, week)}
          />
          {plan.blockWeeks ? (
            <View className="flex-row gap-2 pt-3">
              {!status?.deload ? (
                <Button
                  label={t('plan.deloadNow')}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onPress={() => void deloadNow(plan.id, week)}
                />
              ) : null}
              <Button
                label={t('plan.restartBlock')}
                variant="secondary"
                size="sm"
                className="flex-1"
                onPress={() => void restartBlock(plan.id, week)}
              />
            </View>
          ) : null}
        </Setting>

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
        <Button
          label={t('list.addRoutine')}
          icon="plus"
          size="sm"
          variant="secondary"
          className="mx-4 mt-3 self-start"
          onPress={() => router.push({ pathname: '/routine/new', params: { planId: plan.id } })}
        />
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
          await renamePlan(plan.id, name);
          setRenameOpen(false);
        }}
      />
      <RoutineMenu routine={menuFor} onClose={() => setMenuFor(null)} />
    </Screen>
  );
}
