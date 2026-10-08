import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { type ExerciseId, getExercise } from '@/shared/data/exercises';
import type { TemplateExerciseDetail } from '@/shared/data/templates';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { RirBadge } from '@/shared/ui/rir-badge';
import { Text } from '@/shared/ui/text';

import { exerciseMuscles, formatReps } from '../lib/training-ui';

export interface TemplateExerciseCardProps {
  exercise: TemplateExerciseDetail;
  onMenu: () => void;
  onPress: () => void;
}

/** Exercise row of the training overview: photo, name, target sets with RIR, muscles (03·0b). */
export function TemplateExerciseCard({ exercise, onMenu, onPress }: TemplateExerciseCardProps) {
  const { t } = useTranslation(['exercises', 'muscles', 'training']);
  const image = getExercise(exercise.exerciseId)?.image;
  const name = t(`exercises:${exercise.exerciseId as ExerciseId}.name`);
  const { primary, secondary } = exerciseMuscles(exercise.exerciseId);

  return (
    <PressableScale
      haptic="none"
      activeScale={0.99}
      onPress={onPress}
      className="flex-row gap-3.5 py-[18px]"
    >
      <View className="h-[86px] w-16 items-center justify-center overflow-hidden rounded-[5px] bg-elevated">
        {image ? (
          <Image source={image} contentFit="cover" style={{ width: '100%', height: '100%' }} />
        ) : (
          <Icon name="dumbbell" size={22} color={colors.dim} />
        )}
      </View>
      <View className="min-w-0 flex-1 gap-2.5">
        <View className="flex-row items-start gap-2.5">
          <Text variant="label" className="flex-1 pt-[5px] text-base leading-5">
            {name}
          </Text>
          <PressableScale
            hitSlop={8}
            accessibilityLabel={t('training:overview.exerciseMenu', { name })}
            onPress={onMenu}
            className="size-8 items-center justify-center gap-[3px]"
          >
            {[0, 1, 2].map((i) => (
              <View key={i} className="size-[3.5px] rounded-full bg-[#E6E6E1]" />
            ))}
          </PressableScale>
        </View>
        <View className="gap-1.5">
          {exercise.sets.map((set, i) => (
            <View key={set.id} className="flex-row items-center gap-2.5">
              <View className="size-6 items-center justify-center rounded-full bg-elevated">
                <Text variant="caption" className="text-xs">
                  {i + 1}
                </Text>
              </View>
              <Text variant="body" className="flex-1 text-sm text-[#E6E6E1]">
                {formatReps(set.reps_min ?? 0, set.reps_max ?? set.reps_min ?? 0)}
              </Text>
              {set.rir != null ? <RirBadge rir={set.rir} /> : null}
            </View>
          ))}
        </View>
        {primary.length ? (
          <View className="flex-row flex-wrap gap-1.5">
            {primary.map((m) => (
              <View key={m} className="h-7 justify-center rounded-full bg-elevated px-2.5">
                <Text variant="caption" className="text-xs">
                  {t(`muscles:names.${m}`)}
                </Text>
              </View>
            ))}
            {secondary.map((m) => (
              <View key={m} className="h-7 justify-center rounded-full border border-[#333] px-2.5">
                <Text variant="body" tone="muted" className="text-xs">
                  {t(`muscles:names.${m}`)}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </PressableScale>
  );
}
