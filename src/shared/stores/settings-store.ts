import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AppLanguage } from '@/shared/i18n/resources';
import { mmkvStorage } from '@/shared/lib/storage';

interface SettingsState {
  language: AppLanguage | null;
  /** The countdown and chime at the end of a rest ("Ton bei Pausenende"). */
  restSound: boolean;
  setLanguage: (language: AppLanguage | null) => void;
  setRestSound: (restSound: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: null,
      restSound: true,
      setLanguage: (language) => set({ language }),
      setRestSound: (restSound) => set({ restSound }),
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
