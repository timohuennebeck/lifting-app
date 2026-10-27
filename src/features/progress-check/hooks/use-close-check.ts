import { haptics } from '@/shared/lib/haptics';

import { askDiscardCheck, discardCheck } from '../components/discard-check-sheet';
import { useProgressCheckStore } from '../stores/progress-check-store';

/** Close action of the flow: asks (DiscardCheckSheet) before throwing away photos already taken. */
export function useCloseCheck() {
  return () => {
    if (!Object.keys(useProgressCheckStore.getState().shots).length) return discardCheck();
    haptics.warning();
    askDiscardCheck();
  };
}
