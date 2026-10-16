import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { muscleShares } from '@/shared/data/muscles';
import { type PlanSummary, usePlanStatus } from '@/shared/data/plans';
import type { RoutineSummary } from '@/shared/data/routines';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { MuscleCircle } from '@/shared/ui/muscle-map';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { PlanProgress } from './plan-progress';

export interface PlanOverviewCardProps {
  plan: PlanSummary;
  /** Its routines, in their order. */
  routines: RoutineSummary[];
}

/**
 * A plan Training doesn't follow, as a card: its name and goal, where it stands, and its routines
 * as chips with the muscle each works most. Opens the plan's page, where it can be made active.
 */
export function PlanOverviewCard({ plan, routines }: PlanOverviewCardProps) {
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
      accessibilityLabel={`${plan.name}, ${goal}`}
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
        <Icon name="chevron-right" size={7} color={colors.dim} />
      </View>
      {status ? <PlanProgress plan={plan} status={status} /> : null}
      {routines.length ? (
        <View className="flex-row flex-wrap gap-2">
          {routines.map((routine) => (
            <View
              key={routine.id}
              className="h-9 flex-row items-center gap-2 rounded-full bg-elevated pr-3.5 pl-1"
            >
              <MuscleCircle
                muscle={muscleShares(routine.items)[0]?.muscle ?? null}
                accent={colors.fg2}
                className="size-7 bg-control"
              />
              <Text variant="caption" numberOfLines={1} className="max-w-36 text-sm">
                {routine.name}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </PressableScale>
  );
}
