import { View } from 'react-native';

import type { MuscleShare } from '@/shared/data/muscles';
import { cn } from '@/shared/lib/cn';
import { Text } from '@/shared/ui/text';

import { MuscleStack } from './muscle-stack';

export interface MuscleCardHeaderProps {
  /** The muscles worked, for the circles. */
  shares: MuscleShare[];
  /** The muscles in neon. */
  highlight?: boolean;
  title: string;
  /** Neon line under the title, e.g. the muscle it works most: "Brust 40 %". */
  focus?: string;
  /** The grey line at the bottom, e.g. "48 Min · 5 Übungen". */
  meta: string;
  /** A bigger title (the plan's next routine). */
  large?: boolean;
  className?: string;
}

/** The top of a workout's card: its muscles as circles beside its name and two lines under it. */
export function MuscleCardHeader({
  shares,
  highlight,
  title,
  focus,
  meta,
  large,
  className,
}: MuscleCardHeaderProps) {
  return (
    <View className={cn('flex-row items-center gap-3.5', className)}>
      <MuscleStack shares={shares} highlight={highlight} />
      <View className="min-w-0 flex-1 gap-0.5">
        <Text
          variant="bodyStrong"
          numberOfLines={1}
          className={cn(large && 'text-[19px] leading-6')}
        >
          {title}
        </Text>
        {focus ? (
          <Text variant="caption" tone="accent" numberOfLines={1} className="font-inter-semibold">
            {focus}
          </Text>
        ) : null}
        <Text variant="caption" tone="subtle" numberOfLines={1} className="font-inter-medium">
          {meta}
        </Text>
      </View>
    </View>
  );
}
