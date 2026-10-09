import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ExerciseThumb } from '@/features/exercises/components/exercise-thumb';
import { exerciseName, isTimed } from '@/shared/data/exercises';
import type { TemplateExerciseDetail } from '@/shared/data/templates';
import { formatTarget } from '@/shared/lib/format';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { RirBadge } from '@/shared/ui/rir-badge';
import { Text } from '@/shared/ui/text';

import { splitMuscles } from '../lib/training-ui';

export interface TemplateExerciseCardProps {
  exercise: TemplateExerciseDetail;
  onMenu: () => void;
  onPress: () => void;
}

/** Exercise row of the training overview: photo, name, target sets with RIR, muscles (03·0b). */
export function TemplateExerciseCard({ exercise, onMenu, onPress }: TemplateExerciseCardProps) {
  const { t, i18n } = useTranslation(['muscles', 'training']);
  const name = exerciseName(exercise.exerciseId, i18n.language);
  const timed = isTimed(exercise.exerciseId);
  const { primary, secondary } = splitMuscles(exercise.exerciseId);

  return (
    <PressableScale
      haptic="none"
      activeScale={0.99}
      onPress={onPress}
      className="flex-row gap-3.5 py-4.5"
    >
      <ExerciseThumb
        exerciseId={exercise.exerciseId}
        name={name}
        className="h-21.5 w-16 bg-elevated"
      />
      <View className="min-w-0 flex-1 gap-2.5">
        <View className="flex-row items-start gap-2.5">
          <Text variant="label" className="flex-1 pt-1.25 text-base leading-5">
            {name}
          </Text>
          <PressableScale
            hitSlop={8}
            accessibilityLabel={t('training:overview.exerciseMenu', { name })}
            onPress={onMenu}
            className="size-8 items-center justify-center gap-0.75"
          >
            {[0, 1, 2].map((i) => (
              <View key={i} className="size-[3.5px] rounded-full bg-fg-soft" />
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
              <Text variant="body" className="flex-1 text-sm text-fg-soft">
                {formatTarget(set.target_min, set.target_max, timed)}
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
