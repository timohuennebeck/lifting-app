import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from '@/shared/lib/storage';
import type { MuscleId } from '@/shared/ui/muscle-map';

interface LevelSeenState {
  /** Each muscle's level when the Level tab was last left: higher ones now are new. */
  levels: Partial<Record<MuscleId, number>>;
  save: (levels: Partial<Record<MuscleId, number>>) => void;
  reset: () => void;
}

/** The levels the user has seen (this device), for the "Neu" chip on the Level tab. */
export const useLevelSeenStore = create<LevelSeenState>()(
  persist(
    (set) => ({
      levels: {},
      save: (levels) => set({ levels }),
      reset: () => set({ levels: {} }),
    }),
    { name: 'level-seen', storage: createJSONStorage(() => mmkvStorage) },
  ),
);
