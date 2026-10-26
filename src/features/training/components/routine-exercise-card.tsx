import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ExerciseThumb } from '@/features/exercises/components/exercise-thumb';
import { isTimed, useExercise, useExerciseName } from '@/shared/data/exercises';
import { splitMuscles } from '@/shared/data/muscle-groups';
import type { SetTarget } from '@/shared/data/routines';
import { formatTargetLabel } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { RirBadge } from '@/shared/ui/rir-badge';
import { Text } from '@/shared/ui/text';

export interface RoutineExerciseCardProps {
  exerciseId: string;
  /** Target sets: rep (or second) range and RIR. */
  sets: SetTarget[];
  onMenu: () => void;
  onPress: () => void;
  /** Amber dot after the name: the plan import isn't sure about this match. */
  review?: boolean;
  /** "Neu" after the name: just added (from the picker or by voice). */
  fresh?: boolean;
  /** Below the muscles, e.g. the import's "read as …" prompt. */
  children?: ReactNode;
}

/** An exercise's muscles as chips: the main ones filled, the others outlined. */
function ExerciseMuscleChips({ exerciseId }: { exerciseId: string }) {
  const { t } = useTranslation('muscles');
  const { primary, secondary } = splitMuscles(useExercise(exerciseId));
  if (!primary.length) return null;
  return (
    <View className="flex-row flex-wrap gap-1.5">
      {primary.map((m) => (
        <View key={m} className="h-7 justify-center rounded-full bg-elevated px-2.5">
          <Text variant="caption" className="text-xs">
            {t(`names.${m}`)}
          </Text>
        </View>
      ))}
      {secondary.map((m) => (
        <View key={m} className="h-7 justify-center rounded-full border border-[#333] px-2.5">
          <Text variant="body" tone="muted" className="text-xs">
            {t(`names.${m}`)}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Exercise row of the training overview: photo, name, target sets with RIR, muscles (03·0b). */
export function RoutineExerciseCard({
  exerciseId,
  sets,
  onMenu,
  onPress,
  review,
  fresh,
  children,
}: RoutineExerciseCardProps) {
  const { t, i18n } = useTranslation('training');
  const name = useExerciseName(exerciseId, i18n.language);
  const timed = isTimed(exerciseId);

  return (
    <PressableScale
      haptic="none"
      activeScale={0.99}
      onPress={onPress}
      className="flex-row gap-3.5 py-4.5"
    >
      {/* The photo opens how the exercise works and its history; the rest of the row edits it. */}
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={t('overview.exerciseInfo', { name })}
        onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: exerciseId } })}
      >
        <ExerciseThumb exerciseId={exerciseId} name={name} className="h-21.5 w-16 bg-elevated" />
      </PressableScale>
      <View className="min-w-0 flex-1 gap-2.5">
        <View className="flex-row items-start gap-2.5">
          <Text variant="label" className="flex-1 pt-1.25 text-base leading-5">
            {name}
          </Text>
          {review ? (
            <View className="mt-3 size-2 rounded-full" style={{ backgroundColor: colors.review }} />
          ) : null}
          {fresh ? (
            <View className="mt-1 h-6 justify-center rounded-full bg-accent px-2.5">
              <Text variant="caption" tone="onAccent" className="font-inter-bold text-xs">
                {t('overview.new')}
              </Text>
            </View>
          ) : null}
          {/* As wide as an RIR badge, so the dots line up over the badges below. */}
          <PressableScale
            hitSlop={{ top: 8, bottom: 8, left: 13, right: 13 }}
            accessibilityLabel={t('overview.exerciseMenu', { name })}
            onPress={onMenu}
            className="h-8 w-5.5 items-center justify-center gap-0.75"
          >
            {[0, 1, 2].map((i) => (
              <View key={i} className="size-[3.5px] rounded-full bg-fg-soft" />
            ))}
          </PressableScale>
        </View>
        <View className="gap-1.5">
          {sets.map((set, i) => (
            <View key={i} className="flex-row items-center gap-2.5">
              <View className="size-6 items-center justify-center rounded-full bg-elevated">
                <Text variant="caption" className="text-xs">
                  {i + 1}
                </Text>
              </View>
              <Text variant="body" className="flex-1 text-sm text-fg-soft">
                {formatTargetLabel(set.targetMin, set.targetMax, timed) ?? '–'}
              </Text>
              {set.rir != null ? <RirBadge rir={set.rir} /> : null}
            </View>
          ))}
        </View>
        <ExerciseMuscleChips exerciseId={exerciseId} />
        {children}
      </View>
    </PressableScale>
  );
}
