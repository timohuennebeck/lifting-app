import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from '@/shared/lib/storage';

/** The Training tab's groups that fold: the plan card, the plan's routines, the single ones. */
export type TrainingSection = 'plan' | 'planRoutines' | 'singles';

interface SectionFoldState {
  /** The groups folded away under their title (this device); missing ones show. */
  folded: Partial<Record<TrainingSection, boolean>>;
  toggle: (section: TrainingSection) => void;
}

export const useSectionFoldStore = create<SectionFoldState>()(
  persist(
    (set) => ({
      folded: {},
      toggle: (section) => set((s) => ({ folded: { ...s.folded, [section]: !s.folded[section] } })),
    }),
    { name: 'training-sections', storage: createJSONStorage(() => mmkvStorage) },
  ),
);
