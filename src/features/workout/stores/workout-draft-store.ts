import { create } from 'zustand';

import { defaultSetDrafts, swapTargets } from '@/shared/data/exercises';
import type { PlanExerciseDraft, PlanSetDraft } from '@/shared/data/templates';

/** Sets an exercise added to the draft starts with. */
const NEW_SETS = 3;

interface WorkoutDraftState {
  name: string;
  exercises: PlanExerciseDraft[];
  /** Starts a fresh draft. */
  begin: (name: string) => void;
  rename: (name: string) => void;
  add: (exerciseIds: string[]) => void;
  /** Replaces exercise `at`; its sets get new defaults when the measures differ. */
  swap: (at: number, exerciseId: string) => void;
  remove: (at: number) => void;
  move: (at: number, to: number) => void;
  setSets: (at: number, sets: PlanSetDraft[], restSeconds: number | null) => void;
}

/**
 * An empty workout being put together before it starts: exercises and target sets like a
 * template, but one-off (never saved as one). Starting it creates the workout.
 */
export const useWorkoutDraftStore = create<WorkoutDraftState>()((set) => {
  const editAt = (at: number, edit: (e: PlanExerciseDraft) => PlanExerciseDraft) =>
    set((s) => ({ exercises: s.exercises.map((e, i) => (i === at ? edit(e) : e)) }));
  return {
    name: '',
    exercises: [],
    begin: (name) => set({ name, exercises: [] }),
    rename: (name) => set({ name }),
    add: (exerciseIds) =>
      set((s) => ({
        exercises: [
          ...s.exercises,
          ...exerciseIds.map((exerciseId) => ({
            exerciseId,
            sets: defaultSetDrafts(exerciseId, NEW_SETS),
            restSeconds: null,
          })),
        ],
      })),
    swap: (at, exerciseId) =>
      editAt(at, (e) => ({
        ...e,
        exerciseId,
        sets: swapTargets(e.exerciseId, exerciseId)
          ? defaultSetDrafts(exerciseId, e.sets.length)
          : e.sets,
      })),
    remove: (at) => set((s) => ({ exercises: s.exercises.filter((_, i) => i !== at) })),
    move: (at, to) =>
      set((s) => {
        const exercises = [...s.exercises];
        [exercises[at], exercises[to]] = [exercises[to], exercises[at]];
        return { exercises };
      }),
    setSets: (at, sets, restSeconds) => editAt(at, (e) => ({ ...e, sets, restSeconds })),
  };
});
