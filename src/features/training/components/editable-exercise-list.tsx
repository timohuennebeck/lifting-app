import { type ReactNode, useState } from 'react';
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
      />

      <View className="px-5 pt-2">
        {exercises.length ? (
          <Sortable.Grid
            data={exercises}
            keyExtractor={keyOf}
            columns={1}
            scrollableRef={scrollRef}
            sortEnabled={sortEnabled}
            {...(itemEntering !== undefined ? { itemEntering } : {})}
            {...drag.gridProps}
            renderItem={({ item, index }) => (
              <RoutineExerciseCard
                exerciseId={item.exerciseId}
                sets={item.sets}
                review={review?.(item)}
                onMenu={drag.unlessDragging(() => setMenuFor(index))}
                onPress={drag.unlessDragging(() => onOpen(index))}
              >
                {renderExtra?.(item, index)}
              </RoutineExerciseCard>
            )}
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
