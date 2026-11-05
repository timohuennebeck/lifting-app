import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from '@/shared/lib/storage';

import type { SetRange } from '../lib/muscle-sets';

interface SetRangeState {
  /** The days the Sätze tab counts, as last picked there. */
  range: SetRange;
  choose: (range: SetRange) => void;
}

/** The Sätze tab's time range (this device): it opens with the one picked last. */
export const useSetRangeStore = create<SetRangeState>()(
  persist(
    (set) => ({
      range: 7,
      choose: (range) => set({ range }),
    }),
    { name: 'set-range', storage: createJSONStorage(() => mmkvStorage) },
  ),
);
