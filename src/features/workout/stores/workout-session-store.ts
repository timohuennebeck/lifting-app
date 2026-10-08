import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '@/shared/lib/storage';

import { appendKey, backspace, type KeypadKey, nudgeInput } from '../lib/keypad';

export type SetField = 'kg' | 'reps';
export type MiddleColumn = 'targets' | 'last';

interface WorkoutSessionState {
  workoutId: string | null;
  exerciseIndex: number;
  /** Set row being edited; the keypad is open while this is set. */
  selectedSetId: string | null;
  field: SetField;
  input: Record<SetField, string>;
  /** The next key press replaces the field instead of appending. */
  pristine: boolean;
  restEndsAt: number | null;
  restSeconds: number;
  column: MiddleColumn;
  attach: (workoutId: string) => void;
  goTo: (exerciseIndex: number) => void;
  select: (setId: string, input: Record<SetField, string>, field?: SetField) => void;
  focusField: (field: SetField) => void;
  closeKeypad: () => void;
  pressKey: (key: KeypadKey) => void;
  pressBackspace: () => void;
  nudge: (delta: number) => void;
  startRest: (seconds: number) => void;
  addRest: (seconds: number) => void;
  skipRest: () => void;
  toggleColumn: () => void;
  reset: () => void;
}

const idle = {
  exerciseIndex: 0,
  selectedSetId: null,
  field: 'kg' as SetField,
  input: { kg: '', reps: '' },
  pristine: true,
  restEndsAt: null,
  restSeconds: 0,
};

/** UI state of the live workout that isn't stored in the database. */
export const useWorkoutSessionStore = create<WorkoutSessionState>()(
  persist(
    (set) => ({
      ...idle,
      workoutId: null,
      column: 'targets',
      attach: (workoutId) =>
        set((s) =>
          s.workoutId === workoutId
            ? { selectedSetId: null, pristine: true }
            : { ...idle, workoutId },
        ),
      goTo: (exerciseIndex) =>
        set({ exerciseIndex: Math.max(0, exerciseIndex), selectedSetId: null }),
      select: (selectedSetId, input, field = 'kg') =>
        set({ selectedSetId, input, field, pristine: true }),
      focusField: (field) => set({ field, pristine: true }),
      closeKeypad: () => set({ selectedSetId: null }),
      pressKey: (key) =>
        set((s) => ({
          input: {
            ...s.input,
            [s.field]: appendKey(s.input[s.field], key, s.field === 'kg', s.pristine),
          },
          pristine: false,
        })),
      pressBackspace: () =>
        set((s) => ({
          input: { ...s.input, [s.field]: s.pristine ? '' : backspace(s.input[s.field]) },
          pristine: false,
        })),
      nudge: (delta) =>
        set((s) => ({
          input: { ...s.input, [s.field]: nudgeInput(s.input[s.field], delta) },
          pristine: false,
        })),
      startRest: (seconds) =>
        set({ restEndsAt: Date.now() + seconds * 1000, restSeconds: seconds }),
      addRest: (seconds) =>
        set((s) =>
          s.restEndsAt
            ? { restEndsAt: s.restEndsAt + seconds * 1000, restSeconds: s.restSeconds + seconds }
            : {},
        ),
      skipRest: () => set({ restEndsAt: null }),
      toggleColumn: () => set((s) => ({ column: s.column === 'targets' ? 'last' : 'targets' })),
      reset: () => set({ ...idle, workoutId: null }),
    }),
    {
      name: 'workout-session',
      storage: createJSONStorage(() => zustandStorage),
      // Relaunch resumes the current exercise and a running rest timer.
      partialize: (s) => ({
        workoutId: s.workoutId,
        exerciseIndex: s.exerciseIndex,
        restEndsAt: s.restEndsAt,
        restSeconds: s.restSeconds,
        column: s.column,
      }),
    },
  ),
);
