import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from '@/shared/lib/storage';

interface PlatesState {
  /** The number pad shows the plates with their drawing; folded, on one line. */
  open: boolean;
  toggleOpen: () => void;
}

/**
 * How the number pad shows the plates, kept on this device. The bar of each exercise is synced
 * (`exercise_settings`).
 */
export const usePlatesStore = create<PlatesState>()(
  persist(
    (set) => ({
      open: true,
      toggleOpen: () => set((s) => ({ open: !s.open })),
    }),
    {
      name: 'plates',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (s) => ({ open: s.open }),
    },
  ),
);
