import { create } from 'zustand';

interface SplashState {
  /** The Training tab has what it needs to draw all of itself at once. */
  homeReady: boolean;
  /** The check for a new legal version is done, failed included. */
  legalSettled: boolean;
  setHomeReady: () => void;
  setLegalSettled: () => void;
}

/** What the root layout waits for before it hides the splash screen. */
export const useSplashStore = create<SplashState>()((set) => ({
  homeReady: false,
  legalSettled: false,
  setHomeReady: () => set({ homeReady: true }),
  setLegalSettled: () => set({ legalSettled: true }),
}));
