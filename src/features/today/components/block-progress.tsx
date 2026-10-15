import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { Text } from '@/shared/ui/text';

export interface BlockProgressProps {
  planName: string;
  /** Week of the block now, 1 to `blockWeeks`. */
  blockWeek: number;
  /** Weeks of the block, the deload included (the last). */
  blockWeeks: number;
}

/**
 * Where the plan's block stands: its name (with "Deload" in that week), the week of the block and
 * a segment per week, up to now in accent; the deload's segment stands out ahead.
 */
export function BlockProgress({ planName, blockWeek, blockWeeks }: BlockProgressProps) {
  const { t } = useTranslation('today');
  const deload = blockWeek === blockWeeks;
  return (
    <View
      className="gap-2.5 px-4 pb-4"
      accessible
      accessibilityLabel={t('block.a11y', { plan: planName, week: blockWeek, weeks: blockWeeks })}
    >
      <View className="flex-row items-baseline justify-between gap-3">
        <Text variant="caption" numberOfLines={1} className="min-w-0 flex-1 text-sm">
          {deload ? t('block.deload', { plan: planName }) : planName}
        </Text>
        <Text variant="caption" tone="subtle" className="text-sm tabular-nums">
          {t('block.week', { week: blockWeek, weeks: blockWeeks })}
        </Text>
      </View>
      <View className="flex-row gap-1">
        {Array.from({ length: blockWeeks }, (_, i) => (
          <View
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full',
              i < blockWeek ? 'bg-accent' : i === blockWeeks - 1 ? 'bg-fg/80' : 'bg-control',
            )}
          />
        ))}
      </View>
    </View>
  );
}
