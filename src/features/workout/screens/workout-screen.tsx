import { router, useLocalSearchParams } from 'expo-router';
import {
  type ReactNode,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
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
import {
  type SupersetCandidate,
  SupersetSheet,
} from '@/features/training/components/superset-sheet';
import { formatSetParts, useExercise } from '@/shared/data/exercises';
import { heaviestRepTarget, restSecondsFor } from '@/shared/data/routines';
import { pairPlan, unpairPlan } from '@/shared/data/supersets';
import { useHardwareBack } from '@/shared/hooks/use-hardware-back';
import { moved } from '@/shared/lib/array';
import { haptics } from '@/shared/lib/haptics';
import { BottomFade } from '@/shared/ui/bottom-fade';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { afterSheetClose } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

import { EmptyWorkout } from '../components/empty-workout';
import { KeepSupersetSheet } from '../components/keep-superset-sheet';
import { ExercisePage } from '../components/exercise-page';
import { ExerciseStrip } from '../components/exercise-strip';
import { SetKeypad } from '../components/set-keypad';
import { NEXT_BAR_HEIGHT, SupersetNextBar } from '../components/superset-next-bar';
import { WorkoutMenuSheet } from '../components/workout-menu-sheet';
import { WorkoutTopBar } from '../components/workout-top-bar';
import {
  useWorkout,
  type WorkoutDetail,
  type WorkoutExercise,
  type WorkoutSet,
} from '../data/workout-detail';
import {
  removeWorkoutExercise,
  reorderWorkoutExercise,
  setWorkoutSuperset,
} from '../data/workout-mutations';
import { useLiveWorkout } from '../hooks/use-live-workout';
import { useWorkoutActions } from '../hooks/use-workout-actions';
import { useWorkoutActivity } from '../hooks/use-workout-activity';
import { plateSetup } from '../lib/plates';
import { nextInRound } from '../lib/superset-flow';
import { type SetField, useWorkoutSessionStore } from '../stores/workout-session-store';

const SWIPE_DISTANCE = 70;
const SWIPE_VELOCITY = 600;
/** From where the finger let go, the next exercise (already drawn beside) slides into place. */
const SLIDE = { duration: 200, easing: Easing.out(Easing.cubic) };
/** A swipe that didn't go far enough springs back. */
const SNAP_BACK = { duration: 160, easing: Easing.out(Easing.cubic) };
/** Room for the "Finish workout" button over the foot of the sets. */
const FINISH_BAR_HEIGHT = 80;
/** After an exercise's last set, the check shows this long before the next exercise slides in. */
const ADVANCE_MS = 700;

interface LiveWorkoutProps {
  workout: WorkoutDetail;
}

function LiveWorkout({ workout }: LiveWorkoutProps) {
  const { t } = useTranslation(['workout', 'common', 'training']);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [menuOpen, setMenuOpen] = useState(false);
  const [exerciseMenuOpen, setExerciseMenuOpen] = useState(false);
  const [supersetOpen, setSupersetOpen] = useState(false);
  const live = useLiveWorkout(workout);
  useWorkoutActivity(workout, live);
  const { abandon, finish, finishing, keepPrompt, answerKeep, dismissKeep } = useWorkoutActions(
    workout.id,
  );
  const field = useWorkoutSessionStore((s) => s.field);
  const { exercise, exerciseIndex, selectedIndex } = live;
  const exerciseId = exercise?.exerciseId ?? '';
  const setup = plateSetup(exerciseId, useExercise(exerciseId)?.equipment ?? null);
  // Plates for exercises loaded with them, when their sets record a weight.
  const loadedWith = live.measures.includes('weight') ? setup : null;
  const plates = loadedWith ? { exerciseId, setup: loadedWith } : null;
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

  // The exercises sit side by side, one screen width apart; `position` scrolls the row. The
  // shown one and its neighbours are drawn, so a swipe slides the next one in without a wait.
  const position = useSharedValue(-exerciseIndex * width);
  // A swipe switches the exercise as the finger lets go, so the strip changes with the page,
  // while its slide runs on; shown another way (the strip, a reorder), it goes straight there.
  const swipedTo = useSharedValue(-1);
  useEffect(() => {
    if (swipedTo.get() === exerciseIndex) {
      swipedTo.set(-1);
      return;
    }
    position.set(-exerciseIndex * width);
  }, [exerciseIndex, width, position, swipedTo]);
  const swipeTo = (index: number) => {
    if (index < 0 || index >= count || index === exerciseIndex) return;
    swipedTo.set(index);
    go(index);
  };

  // Every set logged; one logged a moment ago counts, as it may not be saved yet.
  const logged = useWorkoutSessionStore((s) => s.logged);
  const isOpen = (s: WorkoutSet) => !s.completedAt && !(s.id in logged);
  const isDone = (e: WorkoutExercise) => e.sets.length > 0 && !e.sets.some(isOpen);
  const exerciseDone = !!exercise && isDone(exercise);
  const slot = live.slots[exerciseIndex] ?? null;
  // The shown exercise's last set logged: the next one with open sets slides in (after it, else
  // an earlier one), unless a box was opened meanwhile. An exercise opened done stays. In a
  // superset with sets left, its rounds lead on instead (`advanceTo`).
  const advance = useEffectEvent(() => {
    if (useWorkoutSessionStore.getState().selectedSetId) return;
    const members = slot ? workout.exercises.slice(slot.start, slot.end + 1) : [];
    if (members.some((e) => !isDone(e))) return;
    const others = workout.exercises.map((_, i) => (exerciseIndex + 1 + i) % count).slice(0, -1);
    const target = others.find((i) => !isDone(workout.exercises[i]));
    if (target === undefined) return;
    position.set(withTiming(-target * width, SLIDE));
    swipeTo(target);
  });
  const shownDone = useRef({ index: exerciseIndex, done: exerciseDone });
  useEffect(() => {
    const before = shownDone.current;
    shownDone.current = { index: exerciseIndex, done: exerciseDone };
    if (before.index !== exerciseIndex || before.done || !exerciseDone) return;
    const id = setTimeout(advance, ADVANCE_MS);
    return () => clearTimeout(id);
  }, [exerciseIndex, exerciseDone]);

  // A set of a superset logged: its partner (or after the rest, the round's first) slides in,
  // unless a box was opened meanwhile.
  const advanceTo = useWorkoutSessionStore((s) => s.advanceTo);
  const slideTo = useEffectEvent((workoutExerciseId: string) => {
    const store = useWorkoutSessionStore.getState();
    store.clearAdvance();
    if (store.selectedSetId) return;
    const target = workout.exercises.findIndex((e) => e.id === workoutExerciseId);
    if (target < 0 || target === exerciseIndex) return;
    position.set(withTiming(-target * width, SLIDE));
    swipeTo(target);
  });
  useEffect(() => {
    if (!advanceTo) return;
    const id = setTimeout(() => slideTo(advanceTo.workoutExerciseId), ADVANCE_MS);
    return () => clearTimeout(id);
  }, [advanceTo]);

  const swipe = Gesture.Pan()
    .activeOffsetX([-16, 16])
    .failOffsetY([-12, 12])
    .onUpdate((e) => {
      const atEdge =
        (e.translationX > 0 && exerciseIndex === 0) ||
        (e.translationX < 0 && exerciseIndex === count - 1);
      position.set(-exerciseIndex * width + (atEdge ? e.translationX * 0.25 : e.translationX));
    })
    .onEnd((e) => {
      // Swiped left: the next exercise; swiped right: the one before.
      let direction = 0;
      if (e.translationX < -SWIPE_DISTANCE || e.velocityX < -SWIPE_VELOCITY) direction = 1;
      else if (e.translationX > SWIPE_DISTANCE || e.velocityX > SWIPE_VELOCITY) direction = -1;
      const target = exerciseIndex + direction;
      if (!direction || target < 0 || target >= count) {
        position.set(withTiming(-exerciseIndex * width, SNAP_BACK));
        return;
      }
      position.set(withTiming(-target * width, SLIDE));
      scheduleOnRN(swipeTo, target);
    });
  const contentStyle = useAnimatedStyle(() => ({ transform: [{ translateX: position.get() }] }));
  const pages = [exerciseIndex - 1, exerciseIndex, exerciseIndex + 1].filter(
    (i) => i >= 0 && i < count,
  );

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
    const ids = workout.exercises.map((e) => e.id);
    const order = moved(ids, ids.indexOf(workoutExerciseId), toIndex);
    if (exercise) follow.current = { id: exercise.id, order: order.join() };
    await reorderWorkoutExercise(workout.id, workoutExerciseId, toIndex);
  };

  // Adding and swapping happen on their own page; picks apply when it closes with "Done".
  const openPicker = (mode: 'add' | 'swap' | 'superset') =>
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

  // Paired or split, the exercise on screen stays on screen at its new place.
  const pairWith = (partnerId: string | null) => {
    if (!exercise) return;
    const plan = partnerId
      ? pairPlan(workout.exercises, exercise.id, partnerId)
      : unpairPlan(workout.exercises, exercise.id);
    follow.current = { id: exercise.id, order: plan.order.join() };
    setSupersetOpen(false);
    haptics.success();
    void setWorkoutSuperset(workout.id, exercise.id, partnerId);
  };

  // The others of the workout, to pair with: those with sets left; its own partners aren't.
  const candidates: SupersetCandidate[] = workout.exercises.flatMap((e, i) => {
    const other = live.slots[i];
    if (i === exerciseIndex || (slot && other?.letter === slot.letter)) return [];
    const left = e.sets.filter(isOpen).length;
    let detail = t('training:supersetSheet.setsLeft', { count: left });
    if (!left) detail = t('training:supersetSheet.done');
    else if (other) detail = t('training:supersetSheet.joins', { letter: other.letter });
    else if (i === exerciseIndex + 1) detail = `${t('training:supersetSheet.next')} · ${detail}`;
    return [{ key: e.id, exerciseId: e.exerciseId, detail, disabled: !left }];
  });
  // Picked first: the next exercise, else the first one in no superset, else the first open one.
  const open = candidates.filter((c) => !c.disabled);
  const indexOf = (key: string) => workout.exercises.findIndex((e) => e.id === key);
  const standalone = open.filter((c) => !live.slots[indexOf(c.key)]);
  const next = standalone.find((c) => indexOf(c.key) === exerciseIndex + 1);
  const firstPick = (next ?? standalone[0] ?? open[0])?.key ?? null;

  // In a superset with this set still to do: the partner that follows it without rest.
  const openIndex = exercise ? exercise.sets.findIndex(isOpen) : -1;
  const partner =
    openIndex >= 0 ? nextInRound(workout.exercises, live.slots, exerciseIndex, isOpen) : null;
  const partnerExercise = partner ? workout.exercises[partner.exerciseIndex] : null;
  const partnerSuggestion = partner
    ? live.suggestions[partnerExercise?.id ?? '']?.[partner.setIndex]?.values
    : undefined;
  let partnerSuggested: string | null = null;
  if (partnerExercise && partnerSuggestion) {
    const { weight, amount } = formatSetParts(
      partnerExercise.exerciseId,
      partnerSuggestion,
      live.units,
    );
    partnerSuggested = weight ? `${weight} × ${amount}` : amount;
  }
  const showNext = !!partnerExercise && !keypadOpen && !allDone;

  function onExerciseMenu(action: ExerciseMenuAction) {
    setExerciseMenuOpen(false);
    if (!exercise) return;
    if (action === 'remove') afterSheetClose(remove);
    else if (action === 'moveUp') void reorder(exercise.id, exerciseIndex - 1);
    else if (action === 'moveDown') void reorder(exercise.id, exerciseIndex + 1);
  }

  // A row tapped outside its boxes opens at its first box; the open row closes instead, as its
  // focused box does.
  const onSelect = (index: number, f: SetField | null) => {
    if (index !== selectedIndex) return live.selectSet(index, f ?? undefined);
    if (f === null || f === field) return live.closeInput();
    useWorkoutSessionStore.getState().focusField(f);
  };

  return (
    <View className="flex-1">
      {exercise ? (
        <>
          <WorkoutTopBar
            startedAt={workout.startedAt}
            restSeconds={restSecondsFor(
              exercise.exerciseId,
              exercise.restSeconds,
              heaviestRepTarget(exercise.sets),
            )}
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
                : insets.bottom +
                  24 +
                  (allDone ? FINISH_BAR_HEIGHT : 0) +
                  (showNext ? NEXT_BAR_HEIGHT : 0),
            }}
          >
            <GestureDetector gesture={swipe}>
              <Animated.View
                style={contentStyle}
                onLayout={(e) => (layout.current.block = e.nativeEvent.layout.y)}
              >
                {pages.map((i) => {
                  const shown = i === exerciseIndex;
                  const page = workout.exercises[i];
                  const pageSlot = live.slots[i];
                  const rounds = pageSlot
                    ? Math.max(
                        ...workout.exercises
                          .slice(pageSlot.start, pageSlot.end + 1)
                          .map((e) => e.sets.length),
                      )
                    : 0;
                  return (
                    // The shown page sets the height; its neighbours lie beside it.
                    <View
                      key={page.id}
                      pointerEvents={shown ? 'auto' : 'none'}
                      style={
                        shown
                          ? { width, left: i * width }
                          : { position: 'absolute', top: 0, width, left: i * width }
                      }
                    >
                      <ExercisePage
                        exercise={page}
                        workoutId={workout.id}
                        suggestions={live.suggestions[page.id] ?? null}
                        last={live.last[page.id]}
                        units={live.units}
                        superset={pageSlot ? { ...pageSlot, rounds } : null}
                        selectedIndex={shown ? selectedIndex : -1}
                        onSelect={onSelect}
                        onToggleDone={live.toggleDone}
                        onToggleAll={live.toggleAll}
                        onSuperset={() => setSupersetOpen(true)}
                        onSwap={() => openPicker('swap')}
                        onMore={() => setExerciseMenuOpen(true)}
                        onTableLayout={shown ? (y) => (layout.current.table = y) : undefined}
                        onRowLayout={
                          shown ? (row, y) => (layout.current.rows[row] = y + 48) : undefined
                        }
                      />
                    </View>
                  );
                })}
              </Animated.View>
            </GestureDetector>
          </ScrollView>
          {allDone && !keypadOpen ? (
            <BottomFade entering={FadeIn.duration(250)}>
              <Button label={t('menu.finish')} loading={finishing} onPress={finish} />
            </BottomFade>
          ) : null}
          {showNext && partner && partnerExercise ? (
            <SupersetNextBar
              exerciseId={partnerExercise.exerciseId}
              label={live.slots[partner.exerciseIndex]?.label ?? ''}
              setIndex={partner.setIndex}
              setCount={partnerExercise.sets.length}
              suggested={partnerSuggested}
            />
          ) : null}
          {keypadOpen ? (
            <SetKeypad
              onConfirm={live.confirmInput}
              onDismiss={live.closeInput}
              onLayout={(e) => setKeypadHeight(e.nativeEvent.layout.height)}
              withRir={live.measures.includes('reps')}
              rirTarget={exercise?.sets[selectedIndex]?.targetRir ?? null}
              onPickRir={live.pickRir}
              plates={plates}
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
        hidden={['editSets', 'swap', 'superset', 'unsuperset']}
        canMoveUp={exerciseIndex > 0}
        canMoveDown={exerciseIndex < count - 1}
        onAction={onExerciseMenu}
      />
      <SupersetSheet
        visible={supersetOpen}
        onClose={() => setSupersetOpen(false)}
        hint={t('superset.sheetHint')}
        candidates={candidates}
        initialKey={firstPick}
        onConfirm={pairWith}
        onPickNew={() => {
          setSupersetOpen(false);
          afterSheetClose(() => openPicker('superset'));
        }}
        onRemove={slot ? () => pairWith(null) : undefined}
      />
      <KeepSupersetSheet
        prompt={keepPrompt}
        onAnswer={(keep) => void answerKeep(keep)}
        onClose={dismissKeep}
      />
      <WorkoutMenuSheet
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        name={workout.name}
        doneSets={live.doneSets}
        totalSets={live.totalSets}
        // Closed first: finishing may ask about a superset in a sheet of its own.
        onFinish={() => {
          setMenuOpen(false);
          afterSheetClose(() => void finish());
        }}
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
