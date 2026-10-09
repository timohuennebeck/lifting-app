import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ExerciseThumb } from '@/features/exercises/components/exercise-thumb';
import { exerciseName, isTimed } from '@/shared/data/exercises';
import { colors } from '@/shared/lib/theme';
import { Chip } from '@/shared/ui/chip';
import { IconButton } from '@/shared/ui/icon-button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { formatScheme } from '../lib/format';
import type { ImportedExercise } from '../lib/plan-import-service';

/** Highlight for lines the analysis wasn't sure about (design 05b "scanning" amber). */
export const REVIEW_COLOR = '#FFB547';

export interface ImportedExerciseRowProps {
  exercise: ImportedExercise;
  onOpen: () => void;
  onSwap: () => void;
  onRemove: () => void;
  /** Accept the uncertain match as read. */
  onConfirm: () => void;
  onPickAlternative: (exerciseId: string) => void;
}

/** One detected exercise with swap/remove, plus a review prompt when the match is uncertain. */
export function ImportedExerciseRow({
  exercise,
  onOpen,
  onSwap,
  onRemove,
  onConfirm,
  onPickAlternative,
}: ImportedExerciseRowProps) {
  const { t, i18n } = useTranslation(['planImport']);
  const name = exerciseName(exercise.exerciseId, i18n.language);

  return (
    <View
      className="rounded-[22px] bg-surface p-2.5 pr-3"
      style={exercise.raw ? { borderWidth: 1.5, borderColor: `${REVIEW_COLOR}80` } : undefined}
    >
      <View className="flex-row items-center gap-2">
        <PressableScale
          haptic="select"
          accessibilityHint={t('planImport:confirm.details')}
          onPress={onOpen}
          className="min-w-0 flex-1 flex-row items-center gap-3"
        >
          <ExerciseThumb exerciseId={exercise.exerciseId} name={name} />
          <View className="min-w-0 flex-1">
            <Text variant="label" numberOfLines={2} className="leading-5">
              {name}
            </Text>
            <Text variant="caption" tone="subtle" className="mt-0.5 font-inter">
              {formatScheme(exercise.sets, isTimed(exercise.exerciseId))}
            </Text>
          </View>
        </PressableScale>
        <IconButton
          icon="swap"
          size={36}
          haptic="select"
          accessibilityLabel={t('planImport:confirm.swap')}
          onPress={onSwap}
        />
        <IconButton
          icon="trash"
          size={36}
          haptic="select"
          color={colors.danger}
          accessibilityLabel={t('planImport:confirm.remove')}
          onPress={onRemove}
        />
      </View>
      {exercise.raw ? (
        <View className="mt-2.5 gap-2 border-t border-line px-1 pt-2.5">
          <Text variant="caption" style={{ color: REVIEW_COLOR }}>
            {t('planImport:confirm.readAs', { raw: exercise.raw })}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <Chip label={t('planImport:confirm.correct')} selected showCheck onPress={onConfirm} />
            {(exercise.alternatives ?? []).map((id) => (
              <Chip
                key={id}
                label={exerciseName(id, i18n.language)}
                onPress={() => onPickAlternative(id)}
              />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}
