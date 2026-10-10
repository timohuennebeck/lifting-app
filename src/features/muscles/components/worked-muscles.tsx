import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { workoutMuscleSplit } from '@/features/exercises/lib/muscle-groups';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { MuscleTileRow } from '@/shared/ui/muscle-map';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { workoutMusclesHref } from '../lib/workout-muscles-link';

export interface WorkedMusclesProps {
  /** The workout's name, the title of the breakdown. */
  title: string;
  items: { exerciseId: string; sets: number }[];
}

/**
 * "Beanspruchte Muskeln ⓘ" with the workout's muscle chips, primary ones first in neon as on the
 * breakdown that ⓘ opens. Nothing without exercises.
 */
export function WorkedMuscles({ title, items }: WorkedMusclesProps) {
  const { t } = useTranslation('training');
  const { primary, secondary } = workoutMuscleSplit(items);
  if (!primary.length && !secondary.length) return null;
  return (
    <>
      <View className="flex-row items-center gap-2 px-5 pt-6">
        <Text variant="headline">{t('overview.musclesWorked')}</Text>
        {/* A filled round button, so it reads as something to tap. */}
        <PressableScale
          haptic="tap"
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={t('overview.musclesInfo')}
          onPress={() => router.push(workoutMusclesHref(title, items))}
          className="size-6.5 items-center justify-center rounded-full bg-control"
        >
          <Icon name="info-glyph" size={12} color={colors.fg} />
        </PressableScale>
      </View>
      <View className="pt-3.5">
        <MuscleTileRow primary={primary} secondary={secondary} />
      </View>
    </>
  );
}
