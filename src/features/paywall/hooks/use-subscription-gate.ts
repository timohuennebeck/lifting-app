import { router, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { useActiveWorkout } from '@/shared/data/workouts';

import { useIsLocked } from '../stores/subscription-store';

/** What a locked account can still open: the paywall flow, and its account (Settings, support). */
const OPEN_PAGES = ['pro', 'settings', 'support'];

/**
 * Sends a locked account (no Pro) from anywhere else in the signed-in app to the paywall. Pages
 * outside it (Terms, Privacy) stay open, and a running workout can still be finished.
 */
export function useSubscriptionGate() {
  const locked = useIsLocked();
  const segments = useSegments();
  const { data: activeWorkout } = useActiveWorkout();
  // ['(app)', 'pro', …]: the page under the signed-in group. The segments are global, so root
  // routes such as legal/[kind] show up here too.
  const inApp = segments[0] === '(app)';
  const page: string = segments[1] ?? '';
  const open = OPEN_PAGES.includes(page) || (page === 'workout' && !!activeWorkout);
  useEffect(() => {
    if (locked && inApp && !open) router.replace('/pro');
  }, [locked, inApp, open]);
}
