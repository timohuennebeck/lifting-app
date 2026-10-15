import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { router } from 'expo-router';

import { openPlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { PagerPage } from '@/shared/components/pager-page';
import { muscleShares } from '@/shared/data/muscles';
import { type PlanSummary, useCurrentPlan, usePlanStatus } from '@/shared/data/plans';
import { type RoutineSummary, useRoutines } from '@/shared/data/routines';
import { colors } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { MuscleCircle } from '@/shared/ui/muscle-map';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { PlanProgress } from '../components/plan-progress';

/** Blocks the empty state sketches, three workouts each. */
const SKETCH_BLOCKS = 3;

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

/** Before the first plan: zero workouts over three empty blocks, and a way to make one. */
function NoPlan({ onCreate }: { onCreate: () => void }) {
  const { t } = useTranslation('training');
  return (
    <View className="flex-1 items-center justify-center px-8 pb-12">
      <View
        className="items-center"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <View className="flex-row items-baseline gap-1.5">
          <Text className="font-inter-semibold text-[88px] leading-[96px] text-control">0</Text>
          <Text className="font-inter-semibold text-lg text-track">{t('empty.workouts')}</Text>
        </View>
        <View className="mt-1 flex-row gap-2.5">
          {Array.from({ length: SKETCH_BLOCKS }, (_, b) => (
            <View key={b} className="items-center gap-3">
              <View className="flex-row gap-0.75">
                {Array.from({ length: 3 }, (_, i) => (
                  <View key={i} className="h-2 w-6 rounded-[3px] bg-control" />
                ))}
              </View>
              <Text variant="caption" tone="subtle" className="text-xs">
                {t('empty.block', { n: b + 1 })}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <Text variant="headline" className="mt-9 text-center">
        {t('empty.planTitle')}
      </Text>
      <Text variant="paragraph" tone="subtle" className="mt-2 text-center">
        {t('empty.planBody')}
      </Text>
      <Button label={t('create.createPlan')} className="mt-6 h-12 px-7" onPress={onCreate} />
    </View>
  );
}

/**
 * Training → Pläne: the user's plans as cards, the one Today follows first; before the first
 * one, a way to make it.
 */
export function MyPlanPage() {
  const { plan, plans, profile, isLoading } = useCurrentPlan();
  const { data: routines = [] } = useRoutines();

  return (
    <PagerPage>
      {plans.length ? (
        <View className="gap-2.5 px-4 pt-5">
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
          {/* The list ends 40pt above the tab bar inset; PagerPage adds 24. */}
          <View className="h-4" />
        </View>
      ) : !isLoading ? (
        <NoPlan onCreate={() => openPlanFlow(profile, '/training')} />
      ) : null}
    </PagerPage>
  );
}
