import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { exerciseInstructions } from '@/shared/data/exercises';
import { muscleShares } from '@/shared/data/muscles';
import { MUSCLE_CARDS, MuscleMap, MuscleTile } from '@/shared/ui/muscle-map';
import { Text } from '@/shared/ui/text';

import { useExerciseId } from '../components/exercise-layout';
import { exerciseMuscles } from '../lib/muscle-groups';

/** Exercise page, "Übung": the worked muscles as chips with their share beside a body map, then the technique. */
export function ExerciseTechniquePage() {
  const exerciseId = useExerciseId();
  const { t, i18n } = useTranslation(['exercises', 'muscles']);
  const insets = useSafeAreaInsets();
  const muscles = exerciseMuscles(exerciseId);
  // Each muscle's share of the exercise, as on the workout page.
  const shares = muscleShares([{ exerciseId, sets: 1 }]);
  const steps = exerciseInstructions(exerciseId, i18n.language);
  const view = muscles[0] ? MUSCLE_CARDS[muscles[0]].view : 'front';

  return (
    <ScrollView
      contentContainerClassName="gap-5 px-4 pt-7"
      contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-row items-start gap-1.5">
        <View className="min-w-0 flex-1 items-start gap-2">
          {shares.map((s) => (
            <MuscleTile key={s.muscle} muscle={s.muscle} percent={s.percent} />
          ))}
        </View>
        <View className="h-45 w-19">
          <MuscleMap view={view} selected={muscles} width={76} height={180} />
        </View>
      </View>
      <View>
        <Text variant="overline" tone="subtle" className="pb-1">
          {t('exercises:detail.technique')}
        </Text>
        {steps.map((step, i) => (
          <View key={i} className="flex-row gap-3.5 py-2.5">
            <View className="size-7.5 items-center justify-center rounded-full bg-elevated">
              <Text variant="caption" className="text-sm">
                {i + 1}
              </Text>
            </View>
            <View className="min-w-0 flex-1">
              <Text variant="bodyStrong" className="text-base">
                {step.title}
              </Text>
              <Text variant="paragraph" tone="muted" className="mt-1 text-sm leading-5">
                {step.text}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
