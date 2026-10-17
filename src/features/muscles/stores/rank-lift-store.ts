import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from '@/shared/lib/storage';

interface RankLiftState {
  /** The exercise the ranks are put in numbers with; null: the user's main lift. */
  exerciseId: string | null;
  choose: (exerciseId: string) => void;
  reset: () => void;
}

/** The lift the user picked for the ranks screen (this device), from the exercise search. */
export const useRankLiftStore = create<RankLiftState>()(
  persist(
    (set) => ({
      exerciseId: null,
      choose: (exerciseId) => set({ exerciseId }),
      reset: () => set({ exerciseId: null }),
    }),
    { name: 'rank-lift', storage: createJSONStorage(() => mmkvStorage) },
  ),
);
