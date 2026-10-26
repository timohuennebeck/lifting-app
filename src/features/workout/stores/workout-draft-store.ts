import { create } from 'zustand';

import type { SpokenExercises } from '@/features/voice-input/lib/spoken-exercises';
import {
  type CustomExercise,
  newExerciseDraft,
  showDraftExercises,
  swapExerciseDraft,
} from '@/shared/data/exercises';
import { newId } from '@/shared/data/json';
import type { ExerciseDraft, SetTarget } from '@/shared/data/routines';

/**
 * A draft exercise; `key` stays with it when it is dragged to another place. One added by voice
 * that it wasn't sure about has what was heard (`raw`) and likely others until it is settled.
 */
export type DraftExercise = ExerciseDraft & { key: string; raw?: string; alternatives?: string[] };

interface WorkoutDraftState {
  name: string;
  exercises: DraftExercise[];
  /** Exercises voice input found that the catalog lacks; created when the workout starts. */
  newExercises: CustomExercise[];
  /** Starts a fresh draft. */
  begin: (name: string) => void;
  rename: (name: string) => void;
  add: (exerciseIds: string[]) => void;
  /** Appends exercises the user said, with their target sets. */
  addSpoken: (spoken: SpokenExercises) => void;
  /** Keeps a voice match the user confirmed. */
  settle: (at: number) => void;
  /** Replaces exercise `at`; its sets get new defaults when the measures differ. */
  swap: (at: number, exerciseId: string) => void;
  remove: (at: number) => void;
  /** Puts exercise `at` at slot `to`; the others close up around it. */
  move: (at: number, to: number) => void;
  setSets: (at: number, sets: SetTarget[], restSeconds: number | null) => void;
}

/** Without voice input's doubts. */
const settled = ({ raw: _raw, alternatives: _alts, ...e }: DraftExercise): DraftExercise => e;

/**
 * An empty workout being put together before it starts: exercises and target sets like a
 * routine, but one-off (never saved as one). Starting it creates the workout.
 */
export const useWorkoutDraftStore = create<WorkoutDraftState>()((set) => {
  const editAt = (at: number, edit: (e: DraftExercise) => DraftExercise) =>
    set((s) => ({ exercises: s.exercises.map((e, i) => (i === at ? edit(e) : e)) }));
  return {
    name: '',
    exercises: [],
    newExercises: [],
    begin: (name) => {
      showDraftExercises('workout', []);
      set({ name, exercises: [], newExercises: [] });
    },
    rename: (name) => set({ name }),
    add: (exerciseIds) =>
      set((s) => ({
        exercises: [
          ...s.exercises,
          ...exerciseIds.map((id) => ({ ...newExerciseDraft(id), key: newId() })),
        ],
      })),
    addSpoken: ({ exercises, newExercises }) =>
      set((s) => {
        const pending = [...s.newExercises, ...newExercises];
        // Shown by name until the workout starts and creates them.
        showDraftExercises('workout', pending);
        return {
          exercises: [...s.exercises, ...exercises.map((e) => ({ ...e, key: newId() }))],
          newExercises: pending,
        };
      }),
    settle: (at) => editAt(at, settled),
    swap: (at, exerciseId) => editAt(at, (e) => settled(swapExerciseDraft(e, exerciseId))),
    remove: (at) => set((s) => ({ exercises: s.exercises.filter((_, i) => i !== at) })),
    move: (at, to) =>
      set((s) => {
        const exercises = s.exercises.filter((_, i) => i !== at);
        exercises.splice(to, 0, s.exercises[at]);
        return { exercises };
      }),
    setSets: (at, sets, restSeconds) => editAt(at, (e) => ({ ...e, sets, restSeconds })),
  };
});
