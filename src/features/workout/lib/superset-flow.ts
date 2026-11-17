import { repTarget, restSecondsFor } from '@/shared/data/routines';
import type { SupersetSlot } from '@/shared/data/supersets';

import type { WorkoutExercise, WorkoutSet } from '../data/workout-detail';

/** A set of the workout to do next: its exercise's index in the workout and its own index. */
export interface RoundStep {
  exerciseIndex: number;
  setIndex: number;
}

/** Whether a set is still to do; `logged` holds sets logged a moment ago, maybe not saved yet. */
export type IsOpen = (set: WorkoutSet) => boolean;

const firstOpen = (exercises: WorkoutExercise[], index: number, isOpen: IsOpen) =>
  exercises[index]?.sets.findIndex(isOpen) ?? -1;

/**
 * In a superset, the partner after exercise `index` with a set still to do: done next, without a
 * rest. Null when `index` is the round's last (the rest follows) or stands alone.
 */
export function nextInRound(
  exercises: WorkoutExercise[],
  slots: (SupersetSlot | null)[],
  index: number,
  isOpen: IsOpen,
): RoundStep | null {
  const slot = slots[index];
  if (!slot) return null;
  for (let i = index + 1; i <= slot.end; i += 1) {
    const setIndex = firstOpen(exercises, i, isOpen);
    if (setIndex >= 0) return { exerciseIndex: i, setIndex };
  }
  return null;
}

/** The superset's first exercise with a set still to do: where the next round starts. */
export function roundStart(
  exercises: WorkoutExercise[],
  slots: (SupersetSlot | null)[],
  index: number,
  isOpen: IsOpen,
): RoundStep | null {
  const slot = slots[index];
  if (!slot) return null;
  for (let i = slot.start; i <= slot.end; i += 1) {
    const setIndex = firstOpen(exercises, i, isOpen);
    if (setIndex >= 0) return { exerciseIndex: i, setIndex };
  }
  return null;
}

/**
 * The rest after set `setIndex` of exercise `index`: in a superset the round's rest, which is the
 * superset's last exercise's (for that round's set), else the exercise's own.
 */
export function restAfter(
  exercises: WorkoutExercise[],
  slots: (SupersetSlot | null)[],
  index: number,
  setIndex: number,
  reps: number | null,
) {
  const slot = slots[index];
  const last = slot ? exercises[slot.end] : exercises[index];
  const set = last.sets[setIndex] ?? exercises[index].sets[setIndex];
  const target = set ? repTarget(set) : null;
  return restSecondsFor(last.exerciseId, last.restSeconds, target ?? reps);
}
