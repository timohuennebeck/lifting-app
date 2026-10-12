import { create } from 'zustand';

/** The custom exercise just created from a picker; the picker picks it once and clears it. */
export const useCreatedExerciseStore = create<{ id: string | null }>(() => ({ id: null }));
