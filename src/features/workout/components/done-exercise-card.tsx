import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ExerciseThumb } from '@/features/exercises/components/exercise-thumb';
import { formatSet, useExerciseName } from '@/shared/data/exercises';
import type { UnitSystem } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { RirBadge } from '@/shared/ui/rir-badge';
import { Text } from '@/shared/ui/text';

import type { WorkoutSet } from '../data/workout-detail';

export interface DoneExerciseCardProps {
  exerciseId: string;
  /** The sets that were done. */
  sets: WorkoutSet[];
  units: UnitSystem;
  /** The set that is the workout's record for this exercise, starred. */
  recordSetId?: string;
}

/**
 * An exercise of a finished workout, laid out like the training overview's: photo, name, each
 * done set with its RIR, a record with a star. Opens the exercise's page.
 */
export function DoneExerciseCard({ exerciseId, sets, units, recordSetId }: DoneExerciseCardProps) {
  const { t, i18n } = useTranslation('training');
  const name = useExerciseName(exerciseId, i18n.language);
  return (
    <PressableScale
      haptic="none"
      activeScale={0.99}
      accessibilityRole="button"
      accessibilityLabel={t('overview.exerciseInfo', { name })}
      onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: exerciseId } })}
      className="flex-row gap-3.5 py-4.5"
    >
      <ExerciseThumb exerciseId={exerciseId} name={name} className="h-21.5 w-16 bg-elevated" />
      <View className="min-w-0 flex-1 gap-2.5">
        <Text variant="label" className="pt-1.25 text-base leading-5">
          {name}
        </Text>
        <View className="gap-1.5">
          {sets.map((set, i) => (
            <View key={set.id} className="flex-row items-center gap-2.5">
              <View className="size-6 items-center justify-center rounded-full bg-elevated">
                <Text variant="caption" className="text-xs">
                  {i + 1}
                </Text>
              </View>
              {/* A record's star right after its value. */}
              <View className="flex-1 flex-row items-center gap-1.5">
                <Text variant="body" className="text-sm text-fg-soft tabular-nums">
                  {formatSet(exerciseId, set, units)}
                </Text>
                {set.id === recordSetId ? (
                  <Icon name="star" size={13} color={colors.accent} />
                ) : null}
              </View>
              {set.targetRir != null ? <RirBadge rir={set.targetRir} /> : null}
            </View>
          ))}
        </View>
      </View>
    </PressableScale>
  );
}
