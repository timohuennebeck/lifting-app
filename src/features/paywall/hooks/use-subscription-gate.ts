import { router, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { useIsLocked } from '../stores/subscription-store';

/** What a locked account can still open: the paywall flow, and its account (Settings, support). */
const OPEN_PAGES = ['pro', 'settings', 'support'];

/** Sends a locked account (no Pro) from anywhere else in the app to the paywall. */
export function useSubscriptionGate() {
  const locked = useIsLocked();
  const segments = useSegments();
  // ['(app)', 'pro', …]: the page under the signed-in group.
  const page: string = segments[1] ?? '';
  useEffect(() => {
    if (locked && !OPEN_PAGES.includes(page)) router.replace('/pro');
  }, [locked, page]);
}
