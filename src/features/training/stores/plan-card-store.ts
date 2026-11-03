import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from '@/shared/lib/storage';

interface PlanCardState {
  /** The active plan's card is folded away under "Aktiver Plan" (this device). */
  folded: boolean;
  toggle: () => void;
}

export const usePlanCardStore = create<PlanCardState>()(
  persist(
    (set) => ({
      folded: false,
      toggle: () => set((s) => ({ folded: !s.folded })),
    }),
    { name: 'training-plan-card', storage: createJSONStorage(() => mmkvStorage) },
  ),
);
