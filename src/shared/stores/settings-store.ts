import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AppLanguage } from '@/shared/i18n/resources';
import { zustandStorage } from '@/shared/lib/storage';

export const ACCENT_OPTIONS = [
  '#DFFF1F',
  '#39FF14',
  '#00F0FF',
  '#FF2E88',
  '#FF6A00',
  '#2E5BFF',
  '#B026FF',
] as const;

interface SettingsState {
  language: AppLanguage | null;
  accent: string;
  setLanguage: (language: AppLanguage | null) => void;
  setAccent: (accent: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: null,
      accent: ACCENT_OPTIONS[0],
      setLanguage: (language) => set({ language }),
      setAccent: (accent) => set({ accent }),
    }),
    { name: 'settings', storage: createJSONStorage(() => zustandStorage) },
  ),
);
