import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ExerciseThumb } from '@/features/exercises/components/exercise-thumb';
import { exerciseName, useCustomExerciseStore } from '@/shared/data/exercises';
import { colors } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { Sheet } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

import type { SupersetsToKeep } from '../data/keep-supersets';

export interface KeepSupersetSheetProps {
  /** The supersets to offer; the sheet shows while set. */
  prompt: SupersetsToKeep | null;
  onAnswer: (keep: boolean) => void;
  /** Closed without an answer: the workout stays open. */
  onClose: () => void;
}

/** On finishing a workout with a superset made in it: keep it in the routine? */
export function KeepSupersetSheet({ prompt, onAnswer, onClose }: KeepSupersetSheetProps) {
  const { t, i18n } = useTranslation('workout');
  const custom = useCustomExerciseStore((s) => s.exercises);
  const group = prompt?.groups[0] ?? [];
  const names = group.map((id) => exerciseName(id, i18n.language, custom));
  return (
    <Sheet visible={!!prompt} onClose={onClose}>
      <View className="flex-row items-center justify-center gap-2.5 pt-3 pb-4.5">
        {group.map((exerciseId, i) => (
          <View key={`${exerciseId}-${i}`} className="flex-row items-center gap-2.5">
            {i > 0 ? (
              <View className="size-7 items-center justify-center rounded-full bg-accent">
                <Icon name="link" size={13} color={colors.onAccent} />
              </View>
            ) : null}
            <ExerciseThumb exerciseId={exerciseId} name={names[i]} className="h-20 w-15" />
          </View>
        ))}
      </View>
      <Text variant="headline" className="text-center">
        {t('keep.title')}
      </Text>
      <Text variant="paragraph" tone="subtle" className="mx-2 mt-2 text-center">
        {t('keep.message', { names: names.join(' + '), routine: prompt?.routineName ?? '' })}
      </Text>
      <View className="mt-6 gap-2.5">
        <Button label={t('keep.add')} onPress={() => onAnswer(true)} />
        <Button label={t('keep.once')} variant="secondary" onPress={() => onAnswer(false)} />
      </View>
    </Sheet>
  );
}
