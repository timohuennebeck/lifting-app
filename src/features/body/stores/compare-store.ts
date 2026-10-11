import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from '@/shared/lib/storage';

interface CompareState {
  beforeId: string | null;
  afterId: string | null;
  /** The newest check when the pair was saved: a newer one replaces "after". */
  newestId: string | null;
  save: (beforeId: string, afterId: string, newestId: string) => void;
  reset: () => void;
}

const EMPTY = { beforeId: null, afterId: null, newestId: null } as const;

/** The before/after pair picked on the compare page, shown on the Körper tab (this device). */
export const useCompareStore = create<CompareState>()(
  persist(
    (set) => ({
      ...EMPTY,
      save: (beforeId, afterId, newestId) => set({ beforeId, afterId, newestId }),
      reset: () => set(EMPTY),
    }),
    { name: 'body-compare', storage: createJSONStorage(() => mmkvStorage) },
  ),
);
