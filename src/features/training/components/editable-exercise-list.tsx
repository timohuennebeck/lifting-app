import { useIsFocused } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import type Animated from 'react-native-reanimated';
import type { AnimatedRef } from 'react-native-reanimated';
import Sortable, { type SortableGridProps } from 'react-native-sortables';

import { WorkedMuscles } from '@/features/muscles/components/worked-muscles';
import { useExerciseName } from '@/shared/data/exercises';
import {
  estimateMinutes,
  exerciseItems,
  type ExerciseDraft,
  supersetRoundRest,
} from '@/shared/data/routines';
import { supersetSlots } from '@/shared/data/supersets';
import { formatDuration } from '@/shared/lib/format';
import { useSortableDrag } from '@/shared/hooks/use-sortable-drag';
import { EmptyExercises } from '@/shared/ui/empty-exercises';
import { afterSheetClose } from '@/shared/ui/sheet';

import { useLastDefined } from '../hooks/use-last-defined';
import { ExerciseListHeader } from './exercise-list-header';
import { type ExerciseMenuAction, ExerciseMenuSheet } from './exercise-menu-sheet';
import { type CardSuperset, RoutineExerciseCard } from './routine-exercise-card';
import { SupersetRestSheet } from './superset-rest-sheet';
import { type SupersetCandidate, SupersetSheet } from './superset-sheet';

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
  /** A tap on a card, or the menu's "edit sets". */
  onOpen: (index: number) => void;
  onSwap: (index: number) => void;
  onRemove: (index: number) => void;
  /** An exercise dragged to another place, or moved up or down with the menu. */
  onMove: (from: number, to: number) => void;
  /**
   * Pairs exercise `index` with `partner` as a superset, or (null) takes it out of its superset;
   * without it the menu offers neither.
   */
  onSuperset?: (index: number, partner: number | null) => void;
  /** Sets the rest after each round of the superset exercise `index` is in. */
  onSupersetRest?: (index: number, seconds: number) => void;
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
  onSwap,
  onRemove,
  onMove,
  onSuperset,
  onSupersetRest,
  review,
  renderExtra,
  footer,
  sortEnabled,
  itemEntering,
}: EditableExerciseListProps<T>) {
  const { t, i18n } = useTranslation('training');
  const [menuFor, setMenuFor] = useState<number | null>(null);
  const [supersetFor, setSupersetFor] = useState<number | null>(null);
  /** The superset (its first exercise's index) whose rest after a round is being set. */
  const [restFor, setRestFor] = useState<number | null>(null);
  // The menu keeps its content while it animates out.
  const menuShown = useLastDefined(menuFor);
  const drag = useSortableDrag<T>(({ fromIndex, toIndex }) => onMove(fromIndex, toIndex));
  const items = exerciseItems(exercises);
  const slots = supersetSlots(
    exercises.map((e) => ({ id: keyOf(e), supersetId: e.supersetId ?? null })),
  );
  /** A card's superset: rounds are the sets all its exercises have; the first card has the head. */
  const supersetOf = (index: number): CardSuperset | null => {
    const slot = slots[index];
    if (!slot) return null;
    const members = exercises.slice(slot.start, slot.end + 1);
    const counts = members.map((e) => e.sets.length);
    const rounds = Math.min(...counts);
    if (index !== slot.start) return { slot, rounds, header: null };
    const rest = supersetRoundRest(members);
    const roundsText = t('superset.rounds', { count: rounds });
    // One exercise with sets past the rounds does them alone.
    const longer = members.flatMap((e, k) => (e.sets.length > rounds ? [k] : []));
    let note = roundsText;
    if (longer.length === 1) {
      const k = longer[0];
      const label = slots[slot.start + k]?.label ?? '';
      const to = members[k].sets.length;
      note =
        to === rounds + 1
          ? t('superset.thenSolo', { rounds: roundsText, set: to, label })
          : t('superset.thenSolos', { rounds: roundsText, from: rounds + 1, to, label });
    }
    const onRest = onSupersetRest ? () => setRestFor(index) : undefined;
    return { slot, rounds, header: { rest: formatDuration(rest), rounds: note, onRest } };
  };

  const restSlot = restFor === null ? null : slots[restFor];
  // Kept while the sheet animates out.
  const restShown = restSlot
    ? supersetRoundRest(exercises.slice(restSlot.start, restSlot.end + 1))
    : 0;

  // The exercises to pair with: all the others but its own superset's.
  const current = supersetFor === null ? null : slots[supersetFor];
  const supersetName = useExerciseName(
    supersetFor === null ? '' : (exercises[supersetFor]?.exerciseId ?? ''),
    i18n.language,
  );
  const candidates: SupersetCandidate[] =
    supersetFor === null
      ? []
      : exercises.flatMap((e, i) => {
          const other = slots[i];
          if (i === supersetFor || (current && other?.letter === current.letter)) return [];
          const sets = t('supersetSheet.sets', { count: e.sets.length });
          let detail = `${sets} · ${t('supersetSheet.movesNext')}`;
          if (other) detail = t('supersetSheet.joins', { letter: other.letter });
          else if (i === supersetFor + 1) detail = `${t('supersetSheet.next')} · ${sets}`;
          return [{ key: String(i), exerciseId: e.exerciseId, detail }];
        });
  // Picked first: the next exercise, else the first one in no superset, else the first.
  const standalone = candidates.filter((c) => !slots[Number(c.key)]);
  const next = standalone.find((c) => Number(c.key) === (supersetFor ?? -2) + 1);
  const firstPick = (next ?? standalone[0] ?? candidates[0])?.key ?? null;

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
    if (action === 'editSets') afterSheetClose(() => onOpen(at));
    else if (action === 'superset') afterSheetClose(() => setSupersetFor(at));
    else if (action === 'unsuperset') onSuperset?.(at, null);
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
                  superset={supersetOf(index)}
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
        canMoveUp={(menuShown ?? 0) > 0}
        canMoveDown={menuShown !== null && menuShown < exercises.length - 1}
        onAction={onAction}
        hidden={onSuperset ? [] : ['superset', 'unsuperset']}
        paired={menuShown !== null && !!slots[menuShown]}
      />

      <SupersetRestSheet
        letter={restFor === null ? null : (slots[restFor]?.letter ?? null)}
        seconds={restShown}
        onSave={(seconds) => {
          if (restFor !== null) onSupersetRest?.(restFor, seconds);
          setRestFor(null);
        }}
        onClose={() => setRestFor(null)}
      />

      <SupersetSheet
        visible={supersetFor !== null}
        onClose={() => setSupersetFor(null)}
        hint={t('supersetSheet.hint', { name: supersetName })}
        candidates={candidates}
        initialKey={firstPick}
        onConfirm={(key) => {
          if (supersetFor !== null) onSuperset?.(supersetFor, Number(key));
          setSupersetFor(null);
        }}
      />
    </>
  );
}
