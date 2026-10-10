import { create } from 'zustand';

export type ProgressView = 'muscles' | 'body';

interface ProgressState {
  view: ProgressView;
  setView: (view: ProgressView) => void;
}

/** The view shown on the Progress tab; it opens on the muscles each time the app starts. */
export const useProgressStore = create<ProgressState>()((set) => ({
  view: 'muscles',
  setView: (view) => set({ view }),
}));
