import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AppLanguage } from '@/shared/i18n/resources';
import { mmkvStorage } from '@/shared/lib/storage';

interface SettingsState {
  language: AppLanguage | null;
  setLanguage: (language: AppLanguage | null) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: null,
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => mmkvStorage),
      // Keeps only what is still a setting (an old accent choice is dropped).
      partialize: (s) => ({ language: s.language }),
    },
  ),
);
