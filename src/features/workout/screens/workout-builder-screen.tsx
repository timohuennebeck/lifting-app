import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Animated, { useAnimatedRef } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ReviewPrompt } from '@/features/plan-import/components/review-prompt';
import { EditableTitle } from '@/features/training/components/editable-title';
import { EditableExerciseList } from '@/features/training/components/editable-exercise-list';
import { getActiveWorkoutId } from '@/shared/data/workouts';
import { haptics } from '@/shared/lib/haptics';
import { requireUserId } from '@/shared/stores/session-store';
import { BottomFade } from '@/shared/ui/bottom-fade';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';

import { startDraftWorkout } from '../data/workout-mutations';
import { trackWorkoutStart } from '../lib/workout-analytics';
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
  const [starting, setStarting] = useState(false);
  // State isn't updated yet on a double tap, which would start two workouts.
  const startingRef = useRef(false);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const empty = exercises.length === 0;

  const openPicker = (params: { mode: 'add' } | { mode: 'swap'; index: string }) =>
    router.push({ pathname: '/workout/new/picker', params });
  const openSets = (index: number) =>
    router.push({ pathname: '/workout/new/sets/[index]', params: { index: String(index) } });

  async function start() {
    if (startingRef.current || empty) return;
    startingRef.current = true;
    setStarting(true);
    try {
      // Only one workout runs at a time; a second one would be orphaned unfinished.
      let workoutId = await getActiveWorkoutId();
      // Not `??`, which the React Compiler can't compile inside a try.
      if (workoutId === null) {
        workoutId = await startDraftWorkout(requireUserId(), name, exercises, newExercises);
        void trackWorkoutStart(workoutId);
      }
      haptics.success();
      router.replace(`/workout/${workoutId}`);
    } catch (error) {
      haptics.error();
      console.error(error);
    }
    startingRef.current = false;
    setStarting(false);
  }

  return (
    <Screen header={<ScreenHeader icon="chevron-left-thin" title={t('builder.title')} />}>
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
          onEditSets={openSets}
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
          loading={starting}
          onPress={start}
        />
      </BottomFade>
    </Screen>
  );
}
