import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { PlanProgress } from '@/features/training/components/plan-progress';
import { MuscleStack } from '@/features/training/components/routine-row';
import { type MuscleShare, muscleShares } from '@/shared/data/muscles';
import type { PlanStatus, PlanSummary } from '@/shared/data/plans';
import type { Goal } from '@/shared/data/profile';
import type { RoutineSummary } from '@/shared/data/routines';
import { Text } from '@/shared/ui/text';

export interface PlanCardProps {
  plan: PlanSummary;
  status: PlanStatus;
  /** Its routines, in their order: the circles show the muscle each works most. */
  routines: RoutineSummary[];
  /** The profile's goal, first in the line under the name; left out when unknown. */
  goal: Goal | null | undefined;
}

/**
 * The plan Training follows: the muscle each of its routines works most in neon, its name, the
 * goal and workouts per block, and where it stands in its blocks.
 */
export function PlanCard({ plan, status, routines, goal }: PlanCardProps) {
  const { t } = useTranslation(['training', 'planCreate']);
  // One circle per routine, each muscle once.
  const tops: MuscleShare[] = [];
  for (const routine of routines) {
    const top = muscleShares(routine.items)[0];
    if (top && !tops.some((s) => s.muscle === top.muscle)) tops.push(top);
  }
  const subtitle = [
    goal ? t(`planCreate:goalShort.${goal}`) : null,
    t('card.perBlock', { count: plan.sessionsPerWeek }),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View className="mx-4 gap-5 rounded-[24px] bg-surface p-5">
      <View className="flex-row items-center gap-3.5">
        <MuscleStack shares={tops} highlight />
        <View className="min-w-0 flex-1 gap-1">
          <Text variant="headline" numberOfLines={1} className="text-[22px] leading-7">
            {plan.name}
          </Text>
          <Text variant="caption" tone="subtle" numberOfLines={2} className="font-inter-medium">
            {subtitle}
          </Text>
        </View>
      </View>
      <PlanProgress plan={plan} status={status} />
    </View>
  );
}
