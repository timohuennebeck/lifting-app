import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Measure } from '@/shared/data/exercises';
import type { SetValues } from '@/shared/lib/format';
import { appendKey, backspace, type KeypadKey } from '@/shared/lib/keypad';
import { mmkvStorage } from '@/shared/lib/storage';

/** The box being typed into: one per measure of the exercise. */
export type SetField = Measure;
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
  /** Boxes typed into since the row was selected: closing the keypad keeps those. */
  edited: SetField[];
  restEndsAt: number | null;
  restSeconds: number;
  column: MiddleColumn;
  /** Values of sets just logged, shown until the database has them (no flash of empty boxes). */
  logged: Record<string, SetValues>;
  /** Values kept in open sets when the keypad closed, shown until the database has them. */
  drafts: Record<string, Partial<SetValues>>;
  attach: (workoutId: string) => void;
  goTo: (exerciseIndex: number) => void;
  select: (setId: string, input: Record<SetField, string>, field: SetField) => void;
  focusField: (field: SetField) => void;
  closeKeypad: () => void;
  pressKey: (key: KeypadKey) => void;
  pressBackspace: () => void;
  startRest: (seconds: number) => void;
  addRest: (seconds: number) => void;
  skipRest: () => void;
  toggleColumn: () => void;
  markLogged: (setId: string, values: SetValues) => void;
  clearLogged: (setId: string) => void;
  markDraft: (setId: string, values: Partial<SetValues>) => void;
  clearDraft: (setId: string) => void;
  reset: () => void;
}

const idle = {
  exerciseIndex: 0,
  selectedSetId: null,
  field: 'weight' as SetField,
  input: { weight: '', reps: '', seconds: '' },
  pristine: true,
  edited: [] as SetField[],
  restEndsAt: null,
  restSeconds: 0,
  logged: {} as Record<string, SetValues>,
  drafts: {} as Record<string, Partial<SetValues>>,
};

const withField = (edited: SetField[], field: SetField) =>
  edited.includes(field) ? edited : [...edited, field];

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
      select: (selectedSetId, input, field) =>
        set({ selectedSetId, input, field, pristine: true, edited: [] }),
      focusField: (field) => set({ field, pristine: true }),
      closeKeypad: () => set({ selectedSetId: null }),
      pressKey: (key) =>
        set((s) => ({
          input: {
            ...s.input,
            [s.field]: appendKey(s.input[s.field], key, s.field === 'weight', s.pristine),
          },
          pristine: false,
          edited: withField(s.edited, s.field),
        })),
      pressBackspace: () =>
        set((s) => ({
          input: { ...s.input, [s.field]: s.pristine ? '' : backspace(s.input[s.field]) },
          pristine: false,
          edited: withField(s.edited, s.field),
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
      markLogged: (setId, values) => set((s) => ({ logged: { ...s.logged, [setId]: values } })),
      clearLogged: (setId) =>
        set((s) => {
          const { [setId]: _gone, ...logged } = s.logged;
          return { logged };
        }),
      markDraft: (setId, values) =>
        set((s) => ({ drafts: { ...s.drafts, [setId]: { ...s.drafts[setId], ...values } } })),
      clearDraft: (setId) =>
        set((s) => {
          const { [setId]: _gone, ...drafts } = s.drafts;
          return { drafts };
        }),
      reset: () => set({ ...idle, workoutId: null }),
    }),
    {
      name: 'workout-session',
      storage: createJSONStorage(() => mmkvStorage),
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
