import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Period } from '@/shared/lib/periods';
import { mmkvStorage } from '@/shared/lib/storage';

interface SetRangeState {
  /** The period the Sätze tab counts, as last picked there. */
  range: Period;
  choose: (range: Period) => void;
}

/** Days the tab kept before the periods (version 0), as the period that covers them. */
const FROM_DAYS: Record<number, Period> = { 7: '1w', 14: '1m', 30: '1m', 90: '3m' };

/** The Sätze tab's period (this device): it opens with the one picked last. */
export const useSetRangeStore = create<SetRangeState>()(
  persist(
    (set) => ({
      range: '1w',
      choose: (range) => set({ range }),
    }),
    {
      name: 'set-range',
      storage: createJSONStorage(() => mmkvStorage),
      version: 1,
      migrate: (old) => {
        const days = (old as { range?: unknown } | undefined)?.range;
        return { range: (typeof days === 'number' && FROM_DAYS[days]) || '1w' } as SetRangeState;
      },
    },
  ),
);
