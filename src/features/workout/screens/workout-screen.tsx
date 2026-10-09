import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, BackHandler, ScrollView, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';

import { ExercisePickerSheet } from '@/features/exercises/components/exercise-picker-sheet';
import type { ExerciseId } from '@/shared/data/exercises';
import { restSecondsFor } from '@/shared/data/templates';
import { addWorkoutExercise, useWorkout, type WorkoutDetail } from '@/shared/data/workouts';
import { haptics } from '@/shared/lib/haptics';
import { useUserId } from '@/shared/stores/session-store';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

import { EmptyWorkout } from '../components/empty-workout';
import { ExerciseActions } from '../components/exercise-actions';
import { ExerciseStrip } from '../components/exercise-strip';
import { PrToast } from '../components/pr-toast';
import { SetTable } from '../components/set-table';
import { TargetsSheet } from '../components/targets-sheet';
import { WeightKeypad } from '../components/weight-keypad';
import { WorkoutFooter } from '../components/workout-footer';
import { WorkoutMenuSheet } from '../components/workout-menu-sheet';
import { WorkoutTopBar } from '../components/workout-top-bar';
import { swapWorkoutExercise } from '../data/workout-mutations';
import { type RecordHit, useLiveWorkout } from '../hooks/use-live-workout';
import { useWorkoutActions } from '../hooks/use-workout-actions';
import { weightStepFor } from '../lib/weight';
import { type SetField, useWorkoutSessionStore } from '../stores/workout-session-store';

type SheetKind = 'menu' | 'targets' | 'swap' | 'add';

interface LiveWorkoutProps {
  workout: WorkoutDetail;
}

function LiveWorkout({ workout }: LiveWorkoutProps) {
  const { t } = useTranslation(['workout', 'exercises', 'common']);
  const userId = useUserId();
  const [record, setRecord] = useState<RecordHit | null>(null);
  const [sheet, setSheet] = useState<SheetKind | null>(null);
  const live = useLiveWorkout(workout, setRecord);
  const { finish, abandon, finishing } = useWorkoutActions(workout.id);
  const goTo = useWorkoutSessionStore((s) => s.goTo);
  const field = useWorkoutSessionStore((s) => s.field);
  const closeKeypad = useWorkoutSessionStore((s) => s.closeKeypad);
  const { exercise, exerciseIndex, selectedIndex, openIndex } = live;
  const count = workout.exercises.length;
  const keypadOpen = selectedIndex >= 0;

  const scrollRef = useRef<ScrollView>(null);
  const layout = useRef({ scrollY: 0, viewport: 0, block: 0, table: 0, rows: [] as number[] });
  const [keypadHeight, setKeypadHeight] = useState(320);

  // Keep the edited row visible above the keypad.
  useEffect(() => {
    if (selectedIndex < 0) return;
    const { scrollY, viewport, block, table, rows } = layout.current;
    const top = block + table + (rows[selectedIndex] ?? 0);
    const visibleBottom = scrollY + viewport - keypadHeight;
    if (top + 56 > visibleBottom) {
      scrollRef.current?.scrollTo({ y: top + 72 - (viewport - keypadHeight), animated: true });
    } else if (top < scrollY) {
      scrollRef.current?.scrollTo({ y: Math.max(0, top - 16), animated: true });
    }
  }, [selectedIndex, keypadHeight]);

  // Android back closes the keypad first.
  useEffect(() => {
    if (!keypadOpen) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      closeKeypad();
      return true;
    });
    return () => sub.remove();
  }, [keypadOpen, closeKeypad]);

  const go = (index: number) => {
    if (index < 0 || index >= count || index === exerciseIndex) return;
    haptics.select();
    goTo(index);
  };

  const swipe = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-24, 24])
    .failOffsetY([-12, 12])
    .onEnd((e) => {
      if (e.translationX < -60) go(exerciseIndex + 1);
      else if (e.translationX > 60) go(exerciseIndex - 1);
    });

  const onSelect = (index: number, f: SetField) => {
    if (index !== selectedIndex) return live.selectSet(index, f);
    if (f === field) return closeKeypad();
    useWorkoutSessionStore.getState().focusField(f);
  };

  const addExercise = async (exerciseId: string) => {
    if (!userId) return;
    setSheet(null);
    await addWorkoutExercise(userId, workout.id, exerciseId);
    goTo(count);
  };

  const swapExercise = (exerciseId: string) => {
    if (!exercise) return;
    const apply = () => {
      setSheet(null);
      closeKeypad();
      void swapWorkoutExercise(exercise.id, exerciseId);
    };
    if (!exercise.sets.some((s) => s.completedAt)) return apply();
    Alert.alert(t('swap.confirmTitle'), t('swap.confirmMessage'), [
      { text: t('common:actions.cancel'), style: 'cancel' },
      { text: t('swap.confirm'), style: 'destructive', onPress: apply },
    ]);
  };

  const exerciseName = exercise ? t(`exercises:${exercise.exerciseId as ExerciseId}.name`) : '';
  const usedIds = workout.exercises.map((e) => e.exerciseId);

  const primary =
    openIndex >= 0
      ? {
          label: t('footer.logSet', { n: openIndex + 1 }),
          onPress: () => live.selectSet(openIndex),
        }
      : live.nextOpenExercise != null
        ? { label: t('footer.nextExercise'), onPress: () => go(live.nextOpenExercise ?? 0) }
        : // Like the menu, never finish a workout without a logged set.
          {
            label: t('footer.finish'),
            onPress: live.doneSets > 0 ? finish : () => setSheet('menu'),
          };

  const shownSet =
    selectedIndex >= 0
      ? selectedIndex
      : openIndex >= 0
        ? openIndex
        : (exercise?.sets.length ?? 1) - 1;

  return (
    <View className="flex-1">
      {exercise ? (
        <>
          <WorkoutTopBar
            startedAt={workout.startedAt}
            progress={(exerciseIndex + 1) / count}
            restSeconds={restSecondsFor(exercise.exerciseId, exercise.restSeconds)}
            onClose={() => setSheet('menu')}
          />
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={32}
            onScroll={(e) => (layout.current.scrollY = e.nativeEvent.contentOffset.y)}
            onLayout={(e) => (layout.current.viewport = e.nativeEvent.layout.height)}
            contentContainerStyle={{ paddingBottom: keypadOpen ? keypadHeight + 24 : 24 }}
          >
            <ExerciseStrip
              exercises={workout.exercises}
              currentIndex={exerciseIndex}
              onSelect={go}
              onAdd={() => setSheet('add')}
            />
            <GestureDetector gesture={swipe}>
              <View onLayout={(e) => (layout.current.block = e.nativeEvent.layout.y)}>
                <View className="px-5 pt-5">
                  <Text className="font-inter-semibold text-[30px] leading-7.5">
                    {exerciseName}
                  </Text>
                  <Text variant="label" tone="subtle" className="mt-2 font-inter">
                    {exercise.sets.length
                      ? t('setOf', { current: shownSet + 1, total: exercise.sets.length })
                      : t('noSets')}
                  </Text>
                </View>
                <ExerciseActions
                  onHistory={() => router.push(`/workout/history/${exercise.exerciseId}`)}
                  onTargets={() => setSheet('targets')}
                  onSwap={() => setSheet('swap')}
                />
                <View onLayout={(e) => (layout.current.table = e.nativeEvent.layout.y)}>
                  <SetTable
                    exercise={exercise}
                    last={live.last}
                    units={live.units}
                    onSelect={onSelect}
                    onToggleDone={live.toggleDone}
                    onRowLayout={(i, y) => (layout.current.rows[i] = y + 48)}
                  />
                </View>
              </View>
            </GestureDetector>
          </ScrollView>
          {keypadOpen ? (
            <WeightKeypad
              weightStep={weightStepFor(exercise.exerciseId, live.units)}
              onConfirm={live.confirmInput}
              onLayout={(e) => setKeypadHeight(e.nativeEvent.layout.height)}
            />
          ) : (
            <WorkoutFooter
              label={primary.label}
              onPress={primary.onPress}
              loading={finishing}
              onPrevious={() => go(exerciseIndex - 1)}
              onNext={() => go(exerciseIndex + 1)}
              hasPrevious={exerciseIndex > 0}
              hasNext={exerciseIndex < count - 1}
            />
          )}
        </>
      ) : (
        <EmptyWorkout
          name={workout.name}
          onBack={abandon}
          onMenu={() => setSheet('menu')}
          onAdd={() => setSheet('add')}
        />
      )}
      <PrToast record={record} units={live.units} onHide={() => setRecord(null)} />
      <WorkoutMenuSheet
        visible={sheet === 'menu'}
        onClose={() => setSheet(null)}
        workoutId={workout.id}
        name={workout.name}
        doneSets={live.doneSets}
        totalSets={live.totalSets}
      />
      <TargetsSheet
        visible={sheet === 'targets'}
        onClose={() => setSheet(null)}
        exercise={exercise}
        exerciseName={exerciseName}
      />
      <ExercisePickerSheet
        visible={sheet === 'swap'}
        onClose={() => setSheet(null)}
        onSelect={swapExercise}
        excludeIds={usedIds}
        title={t('swap.title')}
      />
      <ExercisePickerSheet
        visible={sheet === 'add'}
        onClose={() => setSheet(null)}
        onSelect={addExercise}
        excludeIds={usedIds}
        title={t('addExercise')}
      />
    </View>
  );
}

function MissingWorkout() {
  const { t } = useTranslation(['workout', 'common']);
  return (
    <View className="flex-1 items-center justify-center gap-6 px-8">
      <Text variant="headline" className="text-center">
        {t('missing')}
      </Text>
      <Button label={t('common:actions.close')} variant="secondary" onPress={() => router.back()} />
    </View>
  );
}

/** Live workout logging (designs 03·C, 03·C·2B and the empty state 03·0). */
export function WorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: workout } = useWorkout(id);
  const attach = useWorkoutSessionStore((s) => s.attach);
  // Reset to null on finish/discard, so the closing screen stays blank.
  const attachedId = useWorkoutSessionStore((s) => s.workoutId);

  useEffect(() => {
    if (id) attach(id);
  }, [id, attach]);

  return (
    <Screen>
      {/* A finished workout renders nothing while finish() moves on to the summary. */}
      {workout === undefined || workout?.finishedAt ? null : workout ? (
        <LiveWorkout workout={workout} />
      ) : attachedId === id ? (
        <MissingWorkout />
      ) : null}
    </Screen>
  );
}
