import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { PressableScale, type PressableScaleProps } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import type { ExerciseOption } from '../hooks/use-exercise-search';
import { ExerciseThumb } from './exercise-thumb';

export interface ExerciseIndexRowProps extends PressableScaleProps {
  /** A row of `useLetterIndex`, with the heading above it. */
  item: ExerciseOption & { heading: string | null };
  /** End of the row, e.g. the add button or the best set. */
  trailing?: ReactNode;
  /** Faded out, e.g. while it can't be tapped. */
  dimmed?: boolean;
}

/**
 * Thumbnail, name and muscle group of an exercise in a list with the A–Z index, under its
 * heading. `useLetterIndex` lays the list out with these heights.
 */
export function ExerciseIndexRow({ item, trailing, dimmed, ...pressable }: ExerciseIndexRowProps) {
  const { t } = useTranslation('exercises');
  return (
    <View>
      {item.heading ? (
        <Text variant="overline" tone="subtle" className="pt-4.5 pb-1.5">
          {item.heading}
        </Text>
      ) : null}
      <PressableScale
        haptic="select"
        className="h-19.5 flex-row items-center gap-3.5"
        {...pressable}
      >
        <ExerciseThumb
          exerciseId={item.id}
          name={item.name}
          className={dimmed ? 'opacity-45' : undefined}
        />
        <View className={cn('min-w-0 flex-1', dimmed && 'opacity-45')}>
          <Text variant="label" numberOfLines={2} className="leading-5">
            {item.name}
          </Text>
          <Text variant="caption" tone="subtle" className="mt-0.5 font-inter">
            {t(`groups.${item.group}`)}
          </Text>
        </View>
        {trailing}
      </PressableScale>
    </View>
  );
}
