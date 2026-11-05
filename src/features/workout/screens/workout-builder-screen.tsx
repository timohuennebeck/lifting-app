import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, { useAnimatedRef } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ReviewPrompt } from '@/features/plan-import/components/review-prompt';
import { EditableTitle } from '@/features/training/components/editable-title';
import { EditableExerciseList } from '@/features/training/components/editable-exercise-list';
import { requireUserId } from '@/shared/stores/session-store';
import { BottomFade } from '@/shared/ui/bottom-fade';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';

import { startDraftWorkout } from '../data/workout-mutations';
import { useStartWorkout } from '../hooks/use-start-workout';
import { useWorkoutDraftStore } from '../stores/workout-draft-store';

/**
 * An empty workout put together like a routine (exercises, target sets) before it starts;
 * "Start workout" creates it and opens live logging. One-off: nothing is saved as a routine.
 */
export function WorkoutBuilderScreen() {
  const { t } = useTranslation(['workout', 'training', 'voice', 'common']);
  const insets = useSafeAreaInsets();
  const name = useWorkoutDraftStore((s) => s.name);
  const exercises = useWorkoutDraftStore((s) => s.exercises);
  const newExercises = useWorkoutDraftStore((s) => s.newExercises);
  const settle = useWorkoutDraftStore((s) => s.settle);
  const swap = useWorkoutDraftStore((s) => s.swap);
  const rename = useWorkoutDraftStore((s) => s.rename);
  const remove = useWorkoutDraftStore((s) => s.remove);
  const move = useWorkoutDraftStore((s) => s.move);
  const { start: startWorkout, startingKey } = useStartWorkout('replace');
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const empty = exercises.length === 0;

  const openPicker = (params: { mode: 'add' } | { mode: 'swap'; index: string }) =>
    router.push({ pathname: '/workout/new/picker', params });
  const openSets = (index: number) =>
    router.push({ pathname: '/workout/new/sets/[index]', params: { index: String(index) } });

  async function start() {
    if (empty) return;
    await startWorkout('draft', () =>
      startDraftWorkout(requireUserId(), name, exercises, newExercises),
    );
  }

  return (
    <Screen header={<ScreenHeader title={t('builder.title')} />}>
      <Animated.ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 130 }}
      >
        <EditableTitle value={name} onSubmit={rename} />

        <EditableExerciseList
          title={name}
          exercises={exercises}
          keyOf={(e) => e.key}
          addLabel={t('training:overview.addExercise')}
          emptyHint={t('training:overview.emptyHint')}
          scrollRef={scrollRef}
          onAdd={() => openPicker({ mode: 'add' })}
          onVoice={() => router.push('/workout/new/voice')}
          onOpen={openSets}
          onSwap={(i) => openPicker({ mode: 'swap', index: String(i) })}
          onRemove={remove}
          onMove={move}
          // Voice input wasn't sure: confirm what was heard or pick another.
          review={(e) => !!e.raw}
          renderExtra={(e, i) =>
            e.raw ? (
              <ReviewPrompt
                message={t('voice:heardAs', { raw: e.raw })}
                alternatives={e.alternatives}
                onConfirm={() => settle(i)}
                onPickAlternative={(exerciseId) => swap(i, exerciseId)}
              />
            ) : null
          }
        />
      </Animated.ScrollView>

      <BottomFade>
        <Button
          label={t('training:overview.start')}
          disabled={empty}
          loading={startingKey !== null}
          onPress={start}
        />
      </BottomFade>
    </Screen>
  );
}
