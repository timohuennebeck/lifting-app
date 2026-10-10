import { create } from 'zustand';

export type ProgressView = 'exercises' | 'muscles' | 'body';

interface ProgressState {
  view: ProgressView;
  setView: (view: ProgressView) => void;
}

/** The view shown on the Progress tab; it opens on the exercises each time the app starts. */
export const useProgressStore = create<ProgressState>()((set) => ({
  view: 'exercises',
  setView: (view) => set({ view }),
}));
