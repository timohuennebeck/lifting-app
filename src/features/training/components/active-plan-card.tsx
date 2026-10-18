import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { type MuscleShare, muscleShares } from '@/shared/data/muscles';
import type { PlanStatus, PlanSummary } from '@/shared/data/plans';
import type { Goal } from '@/shared/data/profile';
import type { RoutineSummary } from '@/shared/data/routines';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { PlanProgress } from './plan-progress';
import { MuscleStack } from './routine-row';

export interface ActivePlanCardProps {
  plan: PlanSummary;
  status: PlanStatus;
  /** Its routines, in their order: the circles show the muscle each works most. */
  routines: RoutineSummary[];
  /** The profile's goal, first in the line under the name; left out when unknown. */
  goal: Goal | null | undefined;
  onEdit: () => void;
}

/**
 * The plan Training follows: the muscle each of its routines works most in neon with "Bearbeiten"
 * beside them, its name, the goal and its workouts per plan week, and where it stands
 * (PlanProgress).
 */
export function ActivePlanCard({ plan, status, routines, goal, onEdit }: ActivePlanCardProps) {
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
    <View className="mx-4 gap-5 rounded-[18px] bg-surface p-5">
      <View className="flex-row items-center justify-between gap-3">
        <MuscleStack shares={tops} highlight />
        <PressableScale
          haptic="tap"
          hitSlop={8}
          onPress={onEdit}
          className="h-9 flex-row items-center gap-1.5 rounded-full bg-elevated px-3.5"
        >
          <Icon name="pencil" size={12} color={colors.fg} />
          <Text variant="caption" className="font-inter-semibold">
            {t('card.edit')}
          </Text>
        </PressableScale>
      </View>
      <View className="-mt-1 gap-1">
        <Text variant="headline" numberOfLines={1} className="text-[22px] leading-7">
          {plan.name}
        </Text>
        <Text variant="caption" tone="subtle" numberOfLines={2} className="font-inter-medium">
          {subtitle}
        </Text>
      </View>
      <PlanProgress plan={plan} status={status} />
    </View>
  );
}
