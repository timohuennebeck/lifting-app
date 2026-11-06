import { useEffect } from 'react';

import { useSessionStore } from '@/shared/stores/session-store';

import { sendPendingHistory } from '../lib/save-history';

/**
 * Saves a history imported in onboarding (kept until sign-up, see keepForSignUp) to the account
 * once the app opens; one that couldn't be saved is tried again on the next start.
 */
export function useSendPendingHistory() {
  const userId = useSessionStore((s) => s.session?.user.id);
  useEffect(() => {
    if (!userId) return;
    sendPendingHistory(userId).catch((error: unknown) =>
      console.warn('Saving the imported history failed', error),
    );
  }, [userId]);
}
