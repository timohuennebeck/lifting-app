import { useIsFocused } from 'expo-router';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import type Animated from 'react-native-reanimated';
import type { AnimatedRef } from 'react-native-reanimated';
import Sortable, { type SortableGridProps } from 'react-native-sortables';

import { WorkedMuscles } from '@/features/muscles/components/worked-muscles';
import { estimateMinutes, exerciseItems, type ExerciseDraft } from '@/shared/data/routines';
import { useSortableDrag } from '@/shared/hooks/use-sortable-drag';
import { EmptyExercises } from '@/shared/ui/empty-exercises';
import { afterSheetClose } from '@/shared/ui/sheet';

import { useLastDefined } from '../hooks/use-last-defined';
import { ExerciseListHeader } from './exercise-list-header';
import { type ExerciseMenuAction, ExerciseMenuSheet } from './exercise-menu-sheet';
import { RoutineExerciseCard } from './routine-exercise-card';

/** Back on the screen with new exercises, the list scrolls to the end again after this. */
const SCROLL_AGAIN_MS = 350;
/** For this long the list follows its end while the new cards are laid out. */
const FOLLOW_MS = 1000;

export interface EditableExerciseListProps<T extends ExerciseDraft> {
  /** The training's name, over its muscles. */
  title: string;
  exercises: T[];
  /** Stays with an exercise while it is dragged to another place. */
  keyOf: (exercise: T) => string;
  addLabel: string;
  emptyHint: string;
  /** The scroll view the list is in: dragging near its edges scrolls it. */
  scrollRef: AnimatedRef<Animated.ScrollView>;
  onAdd: () => void;
  /** The microphone next to "+": adds exercises by voice. */
  onVoice?: () => void;
  /** A tap on a card. */
  onOpen: (index: number) => void;
  /** The menu's "edit sets"; without it the menu leaves that out. */
  onEditSets?: (index: number) => void;
  onSwap: (index: number) => void;
  onRemove: (index: number) => void;
  /** An exercise dragged to another place, or moved up or down with the menu. */
  onMove: (from: number, to: number) => void;
  /** Marks a card with the review dot. */
  review?: (exercise: T) => boolean;
  /** Under a card's muscles, e.g. the import's "read as …" prompt. */
  renderExtra?: (exercise: T, index: number) => ReactNode;
  /** Under the last card, e.g. the row still being read. */
  footer?: ReactNode;
  /** Off while the exercises can't be dragged yet (a plan still being read). */
  sortEnabled?: boolean;
  /** How cards come in; the grid's own animation when left out. */
  itemEntering?: SortableGridProps<T>['itemEntering'];
}

/**
 * The exercises of a training as the routine, the import and the workout builder edit them
 * (03·0b): the muscles they work, the count with the time and "add", then a card per exercise.
 * Hold a card to drag it to another place; its "⋯" edits its sets, swaps, moves or removes it.
 */
export function EditableExerciseList<T extends ExerciseDraft>({
  title,
  exercises,
  keyOf,
  addLabel,
  emptyHint,
  scrollRef,
  onAdd,
  onVoice,
  onOpen,
  onEditSets,
  onSwap,
  onRemove,
  onMove,
  review,
  renderExtra,
  footer,
  sortEnabled,
  itemEntering,
}: EditableExerciseListProps<T>) {
  const [menuFor, setMenuFor] = useState<number | null>(null);
  // The menu keeps its content while it animates out.
  const menuShown = useLastDefined(menuFor);
  const drag = useSortableDrag<T>(({ fromIndex, toIndex }) => onMove(fromIndex, toIndex));
  const items = exerciseItems(exercises);

  // Exercises added in the picker or by voice: what wasn't in the list when the screen was left.
  // Back on it, the list scrolls to the end where they go, and they keep a "Neu" until the screen
  // is left for good.
  const focused = useIsFocused();
  const keys = exercises.map(keyOf);
  const latestKeys = useRef(keys);
  /** Scrolling to the end while the new cards are laid out: the list only grows once they are. */
  const following = useRef(false);
  // Not cleared when the new ones are marked (which runs the effect again), only on leaving.
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [left, setLeft] = useState<ReadonlySet<string> | null>(null);
  /** The new ones so far, also those from earlier trips to the picker. */
  const [fresh, setFresh] = useState<ReadonlySet<string>>(() => new Set());
  const arrived = left ? keys.filter((k) => !left.has(k) && !fresh.has(k)) : [];
  const joinedArrived = arrived.join('\n');
  useEffect(() => {
    latestKeys.current = keys;
  });
  useEffect(() => {
    if (!focused) setLeft(new Set(latestKeys.current));
  }, [focused]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    if (!focused || !joinedArrived) return;
    const batch = joinedArrived.split('\n');
    const toEnd = () => scrollRef.current?.scrollToEnd({ animated: true });
    following.current = true;
    timers.current.push(
      setTimeout(() => {
        setFresh((f) => new Set([...f, ...batch]));
        toEnd();
      }, 50),
      setTimeout(toEnd, SCROLL_AGAIN_MS),
      setTimeout(() => (following.current = false), FOLLOW_MS),
    );
  }, [focused, joinedArrived, scrollRef]);

  function onAction(action: ExerciseMenuAction) {
    const at = menuFor;
    setMenuFor(null);
    if (at === null) return;
    if (action === 'editSets') afterSheetClose(() => onEditSets?.(at));
    else if (action === 'swap') afterSheetClose(() => onSwap(at));
    else if (action === 'remove') onRemove(at);
    else onMove(at, at + (action === 'moveUp' ? -1 : 1));
  }

  return (
    <>
      <WorkedMuscles title={title} items={items} />

      <ExerciseListHeader
        count={exercises.length}
        minutes={estimateMinutes(items)}
        addLabel={addLabel}
        onAdd={onAdd}
        onVoice={onVoice}
      />

      <View
        className="px-5 pt-2"
        onLayout={() => following.current && scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {exercises.length ? (
          <Sortable.Grid
            data={exercises}
            keyExtractor={keyOf}
            columns={1}
            scrollableRef={scrollRef}
            sortEnabled={sortEnabled}
            {...(itemEntering !== undefined ? { itemEntering } : {})}
            {...drag.gridProps}
            renderItem={({ item, index }) => {
              const key = keyOf(item);
              return (
                <RoutineExerciseCard
                  exerciseId={item.exerciseId}
                  sets={item.sets}
                  review={review?.(item)}
                  fresh={fresh.has(key) || arrived.includes(key)}
                  onMenu={drag.unlessDragging(() => setMenuFor(index))}
                  onPress={drag.unlessDragging(() => onOpen(index))}
                >
                  {renderExtra?.(item, index)}
                </RoutineExerciseCard>
              );
            }}
          />
        ) : (
          <EmptyExercises hint={emptyHint} />
        )}
        {footer}
      </View>

      <ExerciseMenuSheet
        visible={menuFor !== null}
        onClose={() => setMenuFor(null)}
        hidden={onEditSets ? [] : ['editSets']}
        canMoveUp={(menuShown ?? 0) > 0}
        canMoveDown={menuShown !== null && menuShown < exercises.length - 1}
        onAction={onAction}
      />
    </>
  );
}
