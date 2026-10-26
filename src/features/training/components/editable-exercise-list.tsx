import { useIsFocused } from 'expo-router';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  type AnimatedRef,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
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

/** Back on the screen, the list scrolls to the end first; the new cards come in after that. */
const REVEAL_AFTER_MS = 350;
/** Between one new card coming in and the next. */
const STAGGER_MS = 140;

/** A card added since the screen was left: hidden until it comes in, after `delay`. */
function Reveal({
  hidden,
  delay,
  children,
}: {
  hidden: boolean;
  delay: number;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const shown = useSharedValue(hidden ? 0 : 1);
  useEffect(() => {
    const timing = withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) });
    shown.set(hidden ? 0 : withDelay(delay, timing));
  }, [hidden, delay, shown]);
  const style = useAnimatedStyle(() => ({
    opacity: shown.get(),
    transform: [{ translateY: reduceMotion ? 0 : (1 - shown.get()) * 22 }],
  }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

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
  // Back on it, the list scrolls to the end where they go, they come in one after another and
  // keep a "Neu" until the screen is left for good.
  const focused = useIsFocused();
  const keys = exercises.map(keyOf);
  const latestKeys = useRef(keys);
  /** Scrolling to the end while the new cards are laid out: the list only grows once they are. */
  const following = useRef(false);
  const [left, setLeft] = useState<ReadonlySet<string> | null>(null);
  /** The cards that came in, each with its delay in the batch it came in with. */
  const [revealed, setRevealed] = useState<ReadonlyMap<string, number>>(() => new Map());
  const toReveal = left ? keys.filter((k) => !left.has(k) && !revealed.has(k)) : [];
  const joinedToReveal = toReveal.join('\n');
  useEffect(() => {
    latestKeys.current = keys;
  });
  useEffect(() => {
    if (!focused) setLeft(new Set(latestKeys.current));
  }, [focused]);
  useEffect(() => {
    if (!focused || !joinedToReveal) return;
    const toEnd = () => scrollRef.current?.scrollToEnd({ animated: true });
    following.current = true;
    const scroll = setTimeout(toEnd, 50);
    const batch = joinedToReveal.split('\n').map((k, i) => [k, i * STAGGER_MS] as const);
    const reveal = setTimeout(() => {
      toEnd();
      setRevealed((r) => new Map([...r, ...batch]));
    }, REVEAL_AFTER_MS);
    const settled = setTimeout(() => (following.current = false), 1000);
    return () => {
      clearTimeout(scroll);
      clearTimeout(reveal);
      clearTimeout(settled);
    };
  }, [focused, joinedToReveal, scrollRef]);

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
              const waiting = toReveal.indexOf(key);
              return (
                <Reveal hidden={waiting >= 0} delay={revealed.get(key) ?? 0}>
                  <RoutineExerciseCard
                    exerciseId={item.exerciseId}
                    sets={item.sets}
                    review={review?.(item)}
                    fresh={waiting >= 0 || revealed.has(key)}
                    onMenu={drag.unlessDragging(() => setMenuFor(index))}
                    onPress={drag.unlessDragging(() => onOpen(index))}
                  >
                    {renderExtra?.(item, index)}
                  </RoutineExerciseCard>
                </Reveal>
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
