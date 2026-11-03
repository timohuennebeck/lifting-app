import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from '@/shared/lib/storage';

interface TabBarState {
  /** What the tab bar and the home indicator cover of a tab; null until a tab has measured it. */
  inset: number | null;
}

/** Kept between launches, so a tab has its padding from the first frame. */
export const useTabBarStore = create<TabBarState>()(
  persist((): TabBarState => ({ inset: null }), {
    name: 'tab-bar',
    storage: createJSONStorage(() => mmkvStorage),
  }),
);
