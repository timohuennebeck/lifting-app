import { router, useLocalSearchParams } from 'expo-router';
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Alert, ScrollView, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import { useTranslation } from 'react-i18next';

import {
  type ExerciseMenuAction,
  ExerciseMenuSheet,
} from '@/features/training/components/exercise-menu-sheet';
import { useExerciseName } from '@/shared/data/exercises';
import { restSecondsFor } from '@/shared/data/routines';
import { useHardwareBack } from '@/shared/hooks/use-hardware-back';
import { haptics } from '@/shared/lib/haptics';
import { BottomFade } from '@/shared/ui/bottom-fade';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { afterSheetClose } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

import { EmptyWorkout } from '../components/empty-workout';
import { ExerciseActions } from '../components/exercise-actions';
import { ExerciseStrip } from '../components/exercise-strip';
import { SetKeypad } from '../components/set-keypad';
import { SetTable } from '../components/set-table';
import { WorkoutMenuSheet } from '../components/workout-menu-sheet';
import { WorkoutTopBar } from '../components/workout-top-bar';
import { useWorkout, type WorkoutDetail } from '../data/workout-detail';
import {
  removeWorkoutExercise,
  removeWorkoutSet,
  reorderWorkoutExercise,
} from '../data/workout-mutations';
import { useLiveWorkout } from '../hooks/use-live-workout';
import { useWorkoutActions } from '../hooks/use-workout-actions';
import { type SetField, useWorkoutSessionStore } from '../stores/workout-session-store';

const SWIPE_DISTANCE = 70;
const SWIPE_VELOCITY = 600;
/** The exercise leaves quickly and the next one settles in: about a quarter second in all. */
const SLIDE_OUT = { duration: 110, easing: Easing.in(Easing.quad) };
const SLIDE_IN = { duration: 160, easing: Easing.out(Easing.cubic) };
/** A swipe that didn't go far enough springs back. */
const SNAP_BACK = { duration: 160, easing: Easing.out(Easing.cubic) };
/** Room for the "Finish workout" button over the foot of the sets. */
const FINISH_BAR_HEIGHT = 80;

interface LiveWorkoutProps {
  workout: WorkoutDetail;
}

function LiveWorkout({ workout }: LiveWorkoutProps) {
  const { t, i18n } = useTranslation(['workout', 'common']);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [menuOpen, setMenuOpen] = useState(false);
  const [exerciseMenuOpen, setExerciseMenuOpen] = useState(false);
  const live = useLiveWorkout(workout);
  const { abandon, finish, finishing } = useWorkoutActions(workout.id);
  const field = useWorkoutSessionStore((s) => s.field);
  const { exercise, exerciseIndex, selectedIndex, openIndex } = live;
  const count = workout.exercises.length;
  const keypadOpen = selectedIndex >= 0;
  // Every set logged: "Finish workout" appears at the bottom.
  const allDone = live.totalSets > 0 && live.doneSets === live.totalSets;

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

  // Android back closes the keypad first (what was typed stays).
  useHardwareBack(live.closeInput, keypadOpen);

  const go = (index: number) => {
    if (index < 0 || index >= count || index === exerciseIndex) return;
    haptics.select();
    live.goToExercise(index);
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
    offset.set(withTiming(0, SLIDE_IN));
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
      // Swiped left: the next exercise; swiped right: the one before.
      let direction = 0;
      if (e.translationX < -SWIPE_DISTANCE || e.velocityX < -SWIPE_VELOCITY) direction = 1;
      else if (e.translationX > SWIPE_DISTANCE || e.velocityX > SWIPE_VELOCITY) direction = -1;
      const target = exerciseIndex + direction;
      if (!direction || target < 0 || target >= count) {
        offset.set(withTiming(0, SNAP_BACK));
        return;
      }
      offset.set(
        withTiming(-direction * width, SLIDE_OUT, (done) => {
          if (!done) return;
          slideIn.set(direction);
          scheduleOnRN(go, target);
        }),
      );
    });
  const contentStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.get() }] }));

  // Dragged in the strip: the exercise on screen stays on screen at its new place. It moves
  // with the new order as it loads (before that frame is drawn), and an open keypad stays.
  const follow = useRef<{ id: string; order: string } | null>(null);
  const order = workout.exercises.map((e) => e.id).join();
  useLayoutEffect(() => {
    const pending = follow.current;
    if (pending?.order !== order) return;
    follow.current = null;
    useWorkoutSessionStore.setState({ exerciseIndex: order.split(',').indexOf(pending.id) });
  }, [order]);

  const reorder = async (workoutExerciseId: string, toIndex: number) => {
    const ids = workout.exercises.map((e) => e.id).filter((id) => id !== workoutExerciseId);
    ids.splice(toIndex, 0, workoutExerciseId);
    if (exercise) follow.current = { id: exercise.id, order: ids.join() };
    await reorderWorkoutExercise(workout.id, workoutExerciseId, toIndex);
  };

  // Adding and swapping happen on their own page; picks apply when it closes with "Done".
  const openPicker = (mode: 'add' | 'swap') =>
    router.push({
      pathname: '/workout/picker',
      params: { workoutId: workout.id, mode, workoutExerciseId: exercise?.id ?? '' },
    });

  // Logged sets go with the exercise: ask first then. The next one moves into its place.
  const remove = () => {
    if (!exercise) return;
    const drop = () => {
      // What was typed belongs to sets that are about to go.
      useWorkoutSessionStore.getState().closeKeypad();
      haptics.success();
      void removeWorkoutExercise(exercise.id);
    };
    if (!exercise.sets.some((s) => s.completedAt)) return drop();
    Alert.alert(t('remove.confirmTitle'), t('remove.confirmMessage'), [
      { text: t('common:actions.cancel'), style: 'cancel' },
      { text: t('remove.confirm'), style: 'destructive', onPress: drop },
    ]);
  };

  // A set swiped away: its typed and logged values go with it.
  const removeSet = (index: number) => {
    const set = exercise?.sets[index];
    if (!set) return;
    const store = useWorkoutSessionStore.getState();
    if (store.selectedSetId === set.id) store.closeKeypad();
    store.clearLogged(set.id);
    store.clearDraft(set.id);
    void removeWorkoutSet(set.id);
  };

  function onExerciseMenu(action: ExerciseMenuAction) {
    setExerciseMenuOpen(false);
    if (!exercise) return;
    if (action === 'remove') afterSheetClose(remove);
    else if (action === 'moveUp') void reorder(exercise.id, exerciseIndex - 1);
    else if (action === 'moveDown') void reorder(exercise.id, exerciseIndex + 1);
  }

  const onSelect = (index: number, f: SetField) => {
    if (index !== selectedIndex) return live.selectSet(index, f);
    if (f === field) return live.closeInput();
    useWorkoutSessionStore.getState().focusField(f);
  };

  const exerciseName = useExerciseName(exercise?.exerciseId ?? '', i18n.language);

  // "Set n of m": the set being typed in, else the first open one, else the last.
  let shownSet = (exercise?.sets.length ?? 1) - 1;
  if (selectedIndex >= 0) shownSet = selectedIndex;
  else if (openIndex >= 0) shownSet = openIndex;

  return (
    <View className="flex-1">
      {exercise ? (
        <>
          <WorkoutTopBar
            startedAt={workout.startedAt}
            restSeconds={restSecondsFor(exercise.exerciseId, exercise.restSeconds)}
            onClose={() => setMenuOpen(true)}
          />
          {/* Pinned: the strip stays put while the sets scroll. */}
          <ExerciseStrip
            exercises={workout.exercises}
            currentIndex={exerciseIndex}
            onSelect={go}
            onAdd={() => openPicker('add')}
            onReorder={reorder}
          />
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={32}
            onScroll={(e) => (layout.current.scrollY = e.nativeEvent.contentOffset.y)}
            onLayout={(e) => (layout.current.viewport = e.nativeEvent.layout.height)}
            contentContainerStyle={{
              paddingBottom: keypadOpen
                ? keypadHeight + 24
                : insets.bottom + 24 + (allDone ? FINISH_BAR_HEIGHT : 0),
            }}
          >
            <GestureDetector gesture={swipe}>
              <Animated.View
                style={contentStyle}
                onLayout={(e) => (layout.current.block = e.nativeEvent.layout.y)}
              >
                <View className="px-5 pt-5">
                  <Text className="font-inter-semibold text-[30px] leading-9">{exerciseName}</Text>
                  <Text variant="label" tone="subtle" className="mt-2 font-inter">
                    {exercise.sets.length
                      ? t('setOf', { current: shownSet + 1, total: exercise.sets.length })
                      : t('noSets')}
                  </Text>
                </View>
                <ExerciseActions
                  // How the exercise works and its history (design 06e).
                  onInfo={() =>
                    router.push({ pathname: '/exercise/[id]', params: { id: exercise.exerciseId } })
                  }
                  onTargets={() =>
                    router.push({
                      pathname: '/workout/targets/[exerciseId]',
                      params: { exerciseId: exercise.id, workoutId: workout.id },
                    })
                  }
                  onSwap={() => openPicker('swap')}
                  onMore={() => setExerciseMenuOpen(true)}
                />
                <View onLayout={(e) => (layout.current.table = e.nativeEvent.layout.y)}>
                  <SetTable
                    exercise={exercise}
                    measures={live.measures}
                    last={live.last}
                    units={live.units}
                    onSelect={onSelect}
                    onToggleDone={live.toggleDone}
                    onRemove={removeSet}
                    onRowLayout={(i, y) => (layout.current.rows[i] = y + 48)}
                  />
                </View>
              </Animated.View>
            </GestureDetector>
          </ScrollView>
          {allDone && !keypadOpen ? (
            <BottomFade entering={FadeIn.duration(250)}>
              <Button label={t('menu.finish')} loading={finishing} onPress={finish} />
            </BottomFade>
          ) : null}
          {keypadOpen ? (
            <SetKeypad
              onConfirm={live.confirmInput}
              onDismiss={live.closeInput}
              onLayout={(e) => setKeypadHeight(e.nativeEvent.layout.height)}
            />
          ) : null}
        </>
      ) : (
        <EmptyWorkout
          name={workout.name}
          onBack={abandon}
          onMenu={() => setMenuOpen(true)}
          onAdd={() => openPicker('add')}
        />
      )}
      <ExerciseMenuSheet
        visible={exerciseMenuOpen}
        onClose={() => setExerciseMenuOpen(false)}
        // Targets and swap are chips of their own.
        hidden={['editSets', 'swap']}
        canMoveUp={exerciseIndex > 0}
        canMoveDown={exerciseIndex < count - 1}
        onAction={onExerciseMenu}
      />
      <WorkoutMenuSheet
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        name={workout.name}
        doneSets={live.doneSets}
        totalSets={live.totalSets}
        onFinish={() => void finish()}
        onDiscard={() => void abandon()}
        finishing={finishing}
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

  // Blank while loading, and for a finished workout while finish() moves on to the summary.
  let content: ReactNode = null;
  if (workout && !workout.finishedAt) content = <LiveWorkout workout={workout} />;
  else if (workout === null && attachedId === id) content = <MissingWorkout />;

  return <Screen>{content}</Screen>;
}
