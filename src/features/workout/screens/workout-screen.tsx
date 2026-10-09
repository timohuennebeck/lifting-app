import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import { useTranslation } from 'react-i18next';

import { ExercisePickerSheet } from '@/features/exercises/components/exercise-picker-sheet';
import { exerciseName as nameOf } from '@/shared/data/exercises';
import { restSecondsFor } from '@/shared/data/templates';
import { addWorkoutExercise, useWorkout, type WorkoutDetail } from '@/shared/data/workouts';
import { useHardwareBack } from '@/shared/hooks/use-hardware-back';
import { haptics } from '@/shared/lib/haptics';
import { useUserId } from '@/shared/stores/session-store';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

import { EmptyWorkout } from '../components/empty-workout';
import { ExerciseActions } from '../components/exercise-actions';
import { ExerciseStrip } from '../components/exercise-strip';
import { SetTable } from '../components/set-table';
import { TargetsSheet } from '../components/targets-sheet';
import { WeightKeypad } from '../components/weight-keypad';
import { WorkoutMenuSheet } from '../components/workout-menu-sheet';
import { WorkoutTopBar } from '../components/workout-top-bar';
import { swapWorkoutExercise } from '../data/workout-mutations';
import { useLiveWorkout } from '../hooks/use-live-workout';
import { useWorkoutActions } from '../hooks/use-workout-actions';
import { type SetField, useWorkoutSessionStore } from '../stores/workout-session-store';

type SheetKind = 'menu' | 'targets' | 'picker';

const SWIPE_DISTANCE = 70;
const SWIPE_VELOCITY = 600;
const SLIDE = { duration: 200, easing: Easing.out(Easing.cubic) };

interface LiveWorkoutProps {
  workout: WorkoutDetail;
}

function LiveWorkout({ workout }: LiveWorkoutProps) {
  const { t, i18n } = useTranslation(['workout', 'common']);
  const userId = useUserId();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [sheet, setSheet] = useState<SheetKind | null>(null);
  // Kept after closing so the picker doesn't switch modes while it animates out.
  const [pickerMode, setPickerMode] = useState<'add' | 'swap'>('add');
  const live = useLiveWorkout(workout);
  const { abandon } = useWorkoutActions(workout.id);
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
  useHardwareBack(closeKeypad, keypadOpen);

  const go = (index: number) => {
    if (index < 0 || index >= count || index === exerciseIndex) return;
    haptics.select();
    goTo(index);
  };

  // Swiping the exercise drags it along; past the threshold it slides out and the next slides in.
  const offset = useSharedValue(0);
  // Direction of a swipe in progress: the next exercise slides in from that side once shown.
  const slideIn = useSharedValue(0);
  useEffect(() => {
    const direction = slideIn.get();
    if (!direction) return;
    slideIn.set(0);
    offset.set(direction * width);
    offset.set(withTiming(0, SLIDE));
  }, [exerciseIndex, offset, slideIn, width]);

  const swipe = Gesture.Pan()
    .activeOffsetX([-16, 16])
    .failOffsetY([-12, 12])
    .onUpdate((e) => {
      const atEdge =
        (e.translationX > 0 && exerciseIndex === 0) ||
        (e.translationX < 0 && exerciseIndex === count - 1);
      offset.set(atEdge ? e.translationX * 0.25 : e.translationX);
    })
    .onEnd((e) => {
      const direction =
        e.translationX < -SWIPE_DISTANCE || e.velocityX < -SWIPE_VELOCITY
          ? 1
          : e.translationX > SWIPE_DISTANCE || e.velocityX > SWIPE_VELOCITY
            ? -1
            : 0;
      const target = exerciseIndex + direction;
      if (!direction || target < 0 || target >= count) {
        offset.set(withTiming(0, SLIDE));
        return;
      }
      offset.set(
        withTiming(-direction * width, SLIDE, (done) => {
          if (!done) return;
          slideIn.set(direction);
          scheduleOnRN(go, target);
        }),
      );
    });
  const contentStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.get() }] }));

  const openPicker = (mode: 'add' | 'swap') => {
    setPickerMode(mode);
    setSheet('picker');
  };

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

  const exerciseName = exercise ? nameOf(exercise.exerciseId, i18n.language) : '';
  const usedIds = workout.exercises.map((e) => e.exerciseId);

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
          {/* Pinned: the strip stays put while the sets scroll. */}
          <ExerciseStrip
            exercises={workout.exercises}
            currentIndex={exerciseIndex}
            onSelect={go}
            onAdd={() => openPicker('add')}
          />
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={32}
            onScroll={(e) => (layout.current.scrollY = e.nativeEvent.contentOffset.y)}
            onLayout={(e) => (layout.current.viewport = e.nativeEvent.layout.height)}
            contentContainerStyle={{
              paddingBottom: keypadOpen ? keypadHeight + 24 : insets.bottom + 24,
            }}
          >
            <GestureDetector gesture={swipe}>
              <Animated.View
                style={contentStyle}
                onLayout={(e) => (layout.current.block = e.nativeEvent.layout.y)}
              >
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
                  onSwap={() => openPicker('swap')}
                />
                <View onLayout={(e) => (layout.current.table = e.nativeEvent.layout.y)}>
                  <SetTable
                    exercise={exercise}
                    measures={live.measures}
                    last={live.last}
                    units={live.units}
                    onSelect={onSelect}
                    onToggleDone={live.toggleDone}
                    onRowLayout={(i, y) => (layout.current.rows[i] = y + 48)}
                  />
                </View>
              </Animated.View>
            </GestureDetector>
          </ScrollView>
          {keypadOpen ? (
            <WeightKeypad
              onConfirm={live.confirmInput}
              onLayout={(e) => setKeypadHeight(e.nativeEvent.layout.height)}
            />
          ) : null}
        </>
      ) : (
        <EmptyWorkout
          name={workout.name}
          onBack={abandon}
          onMenu={() => setSheet('menu')}
          onAdd={() => openPicker('add')}
        />
      )}
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
        visible={sheet === 'picker'}
        onClose={() => setSheet(null)}
        onSelect={pickerMode === 'swap' ? swapExercise : addExercise}
        excludeIds={usedIds}
        mode={pickerMode}
        title={pickerMode === 'swap' ? t('swap.title') : t('addExercise')}
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
