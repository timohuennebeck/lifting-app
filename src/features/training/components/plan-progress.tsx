import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import type { PlanStatus, PlanSummary } from '@/shared/data/plans';
import { cn } from '@/shared/lib/cn';
import { Text } from '@/shared/ui/text';

/** Thin diagonal bands, every 5pt, wide enough for the widest segment. */
const STRIPES = Array.from({ length: 80 }, (_, k) => `M${k * 5 - 10} 10L${k * 5} 0`).join('');

/** A segment of the deload week not done yet: striped. */
function DeloadSegment() {
  return (
    <View className="h-2 flex-1 overflow-hidden rounded-[3px] bg-control">
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Path d={STRIPES} stroke="#3A3A3A" strokeWidth={1.5} />
      </Svg>
    </View>
  );
}

export interface PlanProgressProps {
  plan: PlanSummary;
  status: PlanStatus;
}

/**
 * Where the plan stands: one segment per workout, grouped by plan week of its block (or just this
 * plan week for a plan without blocks), done ones in neon, the next one outlined, the deload week
 * striped; under it the plan week with the workout that's next, and how many of the block are
 * done. The UI calls a plan week "Block n", and the block's last week "Deload".
 */
export function PlanProgress({ plan, status }: PlanProgressProps) {
  const { t } = useTranslation('training');
  const perWeek = plan.sessionsPerWeek;
  const weeks = plan.blockWeeks ?? 1;
  // Plan weeks of the block before this one are over, so each had its workouts.
  const done = ((status.blockWeek ?? 1) - 1) * perWeek + status.done;
  const total = weeks * perWeek;
  const week = status.deload
    ? t('plan.deload')
    : t('plan.block', { n: status.blockWeek ?? status.week });
  const label = `${week} · ${t('progress.session', { n: status.done + 1, total: perWeek })}`;
  const count = t('progress.done', { done, total });

  return (
    <View className="gap-2.5" accessible accessibilityLabel={`${label}, ${count}`}>
      <View className="flex-row gap-2">
        {Array.from({ length: weeks }, (_, w) => (
          <View key={w} className="flex-1 flex-row gap-0.75">
            {Array.from({ length: perWeek }, (_, i) => {
              const slot = w * perWeek + i;
              if (slot > done && plan.blockWeeks && w === weeks - 1) {
                return <DeloadSegment key={i} />;
              }
              return (
                <View
                  key={i}
                  className={cn(
                    'h-2 flex-1 rounded-[3px]',
                    slot < done && 'bg-accent',
                    slot === done && 'border-[1.5px] border-accent',
                    slot > done && 'bg-control',
                  )}
                />
              );
            })}
          </View>
        ))}
      </View>
      <View className="flex-row items-baseline gap-3">
        <Text variant="caption" numberOfLines={1} className="min-w-0 flex-1">
          {label}
        </Text>
        <Text variant="caption" tone="subtle" className="font-inter-medium tabular-nums">
          {count}
        </Text>
      </View>
    </View>
  );
}
