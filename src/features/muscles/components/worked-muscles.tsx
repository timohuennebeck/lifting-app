import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { muscleShares } from '@/shared/data/muscles';
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
 * "Beanspruchte Muskeln ⓘ" with the workout's muscle chips; ⓘ opens the breakdown into primary
 * and secondary muscles. Nothing without exercises.
 */
export function WorkedMuscles({ title, items }: WorkedMusclesProps) {
  const { t } = useTranslation('training');
  const shares = muscleShares(items);
  if (!shares.length) return null;
  return (
    <>
      <View className="flex-row items-center gap-2 px-5 pt-6">
        <Text variant="headline">{t('overview.musclesWorked')}</Text>
        <PressableScale
          haptic="tap"
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t('overview.musclesInfo')}
          onPress={() => router.push(workoutMusclesHref(title, items))}
        >
          <Icon name="info" size={18} color={colors.subtle} />
        </PressableScale>
      </View>
      <View className="pt-3.5">
        <MuscleTileRow shares={shares} />
      </View>
    </>
  );
}
