import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, { useAnimatedRef } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Sortable from 'react-native-sortables';

import { EditableTitle } from '@/features/training/components/editable-title';
import {
  type ExerciseMenuAction,
  ExerciseMenuSheet,
} from '@/features/training/components/exercise-menu-sheet';
import { TemplateExerciseCard } from '@/features/training/components/template-exercise-card';
import { WorkedMuscles } from '@/features/muscles/components/worked-muscles';
import { estimateMinutes } from '@/shared/data/templates';
import { getActiveWorkoutId, startDraftWorkout } from '@/shared/data/workouts';
import { useLastDefined } from '@/shared/hooks/use-last-defined';
import { cn } from '@/shared/lib/cn';
import { haptics } from '@/shared/lib/haptics';
import { requireUserId } from '@/shared/stores/session-store';
import { BottomFade } from '@/shared/ui/bottom-fade';
import { Button } from '@/shared/ui/button';
import { EmptyExercises } from '@/shared/ui/empty-exercises';
import { IconButton } from '@/shared/ui/icon-button';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { afterSheetClose } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

import { useWorkoutDraftStore } from '../stores/workout-draft-store';

/**
 * An empty workout put together like a template (exercises, target sets) before it starts;
 * "Start workout" creates it and opens live logging. One-off: nothing is saved as a template.
 */
export function WorkoutBuilderScreen() {
  const { t } = useTranslation(['workout', 'training', 'common']);
  const insets = useSafeAreaInsets();
  const name = useWorkoutDraftStore((s) => s.name);
  const exercises = useWorkoutDraftStore((s) => s.exercises);
  const { rename, remove, move } = useWorkoutDraftStore.getState();
  const [menuFor, setMenuFor] = useState<number | null>(null);
  const menuShown = useLastDefined(menuFor);
  const [starting, setStarting] = useState(false);
  // State isn't updated yet on a double tap, which would start two workouts.
  const startingRef = useRef(false);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  // A drag ends with a release over the card: that must not open its sets.
  const dragging = useRef(false);

  const items = exercises.map((e) => ({
    exerciseId: e.exerciseId,
    sets: e.sets.length,
    restSeconds: e.restSeconds ?? null,
  }));
  const empty = exercises.length === 0;

  const openPicker = (params: { mode: 'add' } | { mode: 'swap'; index: string }) =>
    router.push({ pathname: '/workout/new/picker', params });
  const openSets = (index: number) =>
    router.push({ pathname: '/workout/new/sets/[index]', params: { index: String(index) } });

  function onMenuAction(action: ExerciseMenuAction) {
    const at = menuFor;
    setMenuFor(null);
    if (at === null) return;
    if (action === 'editSets') afterSheetClose(() => openSets(at));
    else if (action === 'swap')
      afterSheetClose(() => openPicker({ mode: 'swap', index: String(at) }));
    else if (action === 'remove') remove(at);
    else move(at, at + (action === 'moveUp' ? -1 : 1));
  }

  async function start() {
    if (startingRef.current || empty) return;
    startingRef.current = true;
    setStarting(true);
    try {
      // Only one workout runs at a time; a second one would be orphaned unfinished.
      const workoutId =
        (await getActiveWorkoutId()) ?? (await startDraftWorkout(requireUserId(), name, exercises));
      haptics.success();
      router.replace(`/workout/${workoutId}`);
    } catch (error) {
      haptics.error();
      console.error(error);
    } finally {
      startingRef.current = false;
      setStarting(false);
    }
  }

  return (
    <Screen header={<ScreenHeader icon="chevron-left-thin" title={t('builder.title')} />}>
      <Animated.ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 130 }}
      >
        <EditableTitle
          value={name}
          accessibilityLabel={t('training:options.rename')}
          onSubmit={rename}
        />

        <WorkedMuscles title={name} items={items} />

        <View className={cn('flex-row items-center gap-3 px-5', empty ? 'pt-9' : 'pt-7.5')}>
          <View className="min-w-0 flex-1">
            <Text variant="headline">
              {empty
                ? t('training:overview.noExercises')
                : t('training:overview.exercises', { count: exercises.length })}
            </Text>
            <Text variant="paragraph" tone="subtle" className="mt-1.5 text-sm leading-4.5">
              {t('training:overview.duration', { minutes: estimateMinutes(items) })}
            </Text>
          </View>
          <IconButton
            icon="plus"
            size={empty ? 56 : 44}
            iconSize={empty ? 18 : 14}
            accessibilityLabel={t('training:overview.addExercise')}
            className="bg-raised"
            onPress={() => openPicker({ mode: 'add' })}
          />
        </View>

        <View className="px-5 pt-2">
          {empty ? (
            <EmptyExercises hint={t('training:overview.emptyHint')} />
          ) : (
            // Hold an exercise to drag it to another place, as in a template.
            <Sortable.Grid
              data={exercises}
              keyExtractor={(e) => e.key}
              columns={1}
              scrollableRef={scrollRef}
              dragActivationDelay={250}
              activeItemScale={1.03}
              inactiveItemOpacity={0.6}
              hapticsEnabled={false}
              onDragStart={() => {
                dragging.current = true;
                haptics.press();
              }}
              onDragEnd={({ fromIndex, toIndex }) => {
                setTimeout(() => (dragging.current = false), 150);
                if (toIndex !== fromIndex) move(fromIndex, toIndex);
              }}
              renderItem={({ item: e, index }) => (
                <TemplateExerciseCard
                  exerciseId={e.exerciseId}
                  sets={e.sets.map((set, k) => ({
                    key: String(k),
                    min: set.targetMin,
                    max: set.targetMax,
                    rir: set.rir,
                  }))}
                  onMenu={() => {
                    if (!dragging.current) setMenuFor(index);
                  }}
                  onPress={() => {
                    if (!dragging.current) openSets(index);
                  }}
                />
              )}
            />
          )}
        </View>
      </Animated.ScrollView>

      <BottomFade>
        <Button
          label={t('training:overview.start')}
          disabled={empty}
          loading={starting}
          onPress={start}
        />
      </BottomFade>

      <ExerciseMenuSheet
        visible={menuFor !== null}
        onClose={() => setMenuFor(null)}
        canMoveUp={(menuShown ?? 0) > 0}
        canMoveDown={menuShown !== null && menuShown < exercises.length - 1}
        onAction={onMenuAction}
      />
    </Screen>
  );
}
