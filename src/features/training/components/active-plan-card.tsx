import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { muscleShares } from '@/shared/data/muscles';
import type { PlanStatus, PlanSummary } from '@/shared/data/plans';
import type { RoutineSummary } from '@/shared/data/routines';
import { colors } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { PlanProgress } from './plan-progress';
import { MuscleStack, useRoutineMeta } from './routine-row';

export interface ActivePlanCardProps {
  plan: PlanSummary;
  /** Undefined while it loads. */
  status: PlanStatus | undefined;
  /** The routine the coach recommends next; undefined while none has exercises. */
  next: RoutineSummary | undefined;
  starting: boolean;
  onStart: (routine: RoutineSummary) => void;
}

/**
 * The plan Today follows: its name, goal and block, where it stands, and the routine that's
 * next with a start button. The top opens the plan, the routine its page.
 */
export function ActivePlanCard({ plan, status, next, starting, onStart }: ActivePlanCardProps) {
  const { t } = useTranslation('training');
  const meta = useRoutineMeta();
  const goal = [
    t('card.perWeek', { count: plan.sessionsPerWeek }),
    plan.blockWeeks ? t('card.block', { build: plan.blockWeeks - 1 }) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View className="mx-4 gap-5 rounded-[24px] bg-surface p-5">
      <PressableScale
        haptic="tap"
        activeScale={0.98}
        accessibilityRole="button"
        accessibilityLabel={`${plan.name}, ${goal}`}
        accessibilityHint={t('myPlan.openPlan')}
        onPress={() => router.push(`/plan/${plan.id}`)}
        className="gap-5"
      >
        <View className="flex-row items-center gap-3">
          <View className="min-w-0 flex-1 gap-1">
            <Text variant="headline" numberOfLines={1} className="text-[22px] leading-7">
              {plan.name}
            </Text>
            <Text variant="caption" tone="subtle" className="font-inter-medium">
              {goal}
            </Text>
          </View>
          <Icon name="chevron-right" size={7} color={colors.dim} />
        </View>
        {status ? <PlanProgress plan={plan} status={status} /> : null}
      </PressableScale>

      {next ? (
        <>
          <PressableScale
            haptic="tap"
            activeScale={0.98}
            accessibilityRole="button"
            accessibilityLabel={`${t('list.recommended')}: ${next.name}, ${meta(next)}`}
            onPress={() => router.push(`/routine/${next.id}`)}
            className="flex-row items-center gap-3.5"
          >
            <MuscleStack shares={muscleShares(next.items)} highlight />
            <View className="min-w-0 flex-1 gap-0.5">
              <Text variant="overline" tone="accent" className="text-[11px]">
                {t('list.recommended')}
              </Text>
              <Text variant="headline" numberOfLines={1}>
                {next.name}
              </Text>
              <Text variant="caption" tone="subtle" numberOfLines={1} className="font-inter-medium">
                {meta(next)}
              </Text>
            </View>
          </PressableScale>
          <Button
            label={t('list.start', { name: next.name })}
            icon="play"
            loading={starting}
            onPress={() => onStart(next)}
          />
        </>
      ) : status ? (
        // Nothing to start yet: every routine still needs its exercises.
        <View className="gap-3">
          <Text variant="paragraph" tone="subtle">
            {t('card.empty')}
          </Text>
          <Button
            label={t('myPlan.openPlan')}
            variant="secondary"
            size="md"
            onPress={() => router.push(`/plan/${plan.id}`)}
          />
        </View>
      ) : null}
    </View>
  );
}
