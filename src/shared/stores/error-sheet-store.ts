import { create } from 'zustand';

export interface ErrorSheetOptions {
  title: string;
  message: string;
  /** Adds "Try again"; without it (or `action`) the sheet only offers "Got it". */
  onRetry?: () => void;
  /** Another main action in place of "Try again", e.g. "Open settings". */
  action?: { label: string; onPress: () => void };
  /** The text button under the main action: "Close" unless given. */
  dismissLabel?: string;
  /** Runs when the sheet goes without its main action: Close, Got it, the backdrop or a drag. */
  onDismiss?: () => void;
}

interface ErrorSheetState {
  /** Kept while the sheet animates out, so its text doesn't vanish first. */
  error: ErrorSheetOptions | null;
  visible: boolean;
}

export const useErrorSheetStore = create<ErrorSheetState>()(() => ({
  error: null,
  visible: false,
}));

/**
 * Shows an error in the app's error sheet (ErrorSheetHost), from a screen or a hook; it stays up
 * when the caller navigates away and waits for an open sheet to close. While one is shown,
 * further errors are dropped.
 */
export function showError(error: ErrorSheetOptions) {
  if (useErrorSheetStore.getState().visible) return;
  useErrorSheetStore.setState({ error, visible: true });
}

export const hideError = () => useErrorSheetStore.setState({ visible: false });
