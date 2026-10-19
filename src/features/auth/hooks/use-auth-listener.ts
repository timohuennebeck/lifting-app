import { useEffect } from 'react';

import { clearLocalPhotos } from '@/features/progress-check/lib/photo-files';
import { useProgressCheckStore } from '@/features/progress-check/stores/progress-check-store';
import { useCompareStore } from '@/features/body/stores/compare-store';
import { useLevelSeenStore } from '@/features/muscles/stores/level-seen-store';
import { useRankLiftStore } from '@/features/muscles/stores/rank-lift-store';
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding-store';
import { purchases } from '@/features/paywall/lib/purchases-service';
import {
  refreshSubscription,
  useSubscriptionStore,
} from '@/features/paywall/stores/subscription-store';
import { useImportStore } from '@/features/plan-import/stores/import-store';
import { clearLocalAttachments } from '@/features/support/data/attachments';
import { useUploadQueueStore } from '@/features/support/stores/upload-queue-store';
import { useWorkoutSessionStore } from '@/features/workout/stores/workout-session-store';
import { connector, db } from '@/shared/data/powersync/database';
import { queryClient } from '@/shared/data/query-client';
import { supabase } from '@/shared/data/supabase';
import { identify, resetAnalytics } from '@/shared/lib/analytics';
import { useSessionStore } from '@/shared/stores/session-store';

import { signOutOfGoogle } from '../lib/google-sign-in';

/** The account PowerSync is connected for, so token refreshes don't reconnect it. */
let connectedUserId: string | null = null;

/** Starts syncing and checks the subscription, once per signed-in account. */
function connectAccount(userId: string) {
  if (connectedUserId === userId) return;
  connectedUserId = userId;
  identify(userId);
  // The connector fetches fresh tokens itself; offline, PowerSync keeps retrying.
  db.connect(connector);
  refreshSubscription(userId);
}

/**
 * Mirrors Supabase auth into the session store and (dis)connects PowerSync. The store starts with
 * the session saved on the device, so a signed-in app opens right away, offline too.
 */
export function useAuthListener() {
  const setSession = useSessionStore((s) => s.setSession);

  useEffect(() => {
    const saved = useSessionStore.getState().session;
    if (saved) connectAccount(saved.user.id);
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        connectedUserId = null;
        setSession(null);
        db.disconnectAndClear();
        queryClient.clear();
        // A later sign-in must check the new account's onboarding state again.
        useOnboardingStore.getState().reset();
        // Drop the previous account's running-workout UI state (rest timer, exercise index).
        useWorkoutSessionStore.getState().reset();
        // Pro belongs to the account; the next one restores its own purchases.
        useSubscriptionStore.getState().reset();
        void purchases.setUser(null).catch((error) => console.warn('Store sign-out failed', error));
        // Screenshot copies are private to the account (and would sit in device backups).
        useUploadQueueStore.getState().reset();
        clearLocalAttachments();
        // Progress-check photos are just as private; clearLocalPhotos also removes the drafts.
        useProgressCheckStore.getState().clear();
        clearLocalPhotos();
        // So is a plan import in progress (its photos and the detected plan).
        useImportStore.getState().reset();
        // The picked before/after checks belong to the account too.
        useCompareStore.getState().reset();
        // And the muscle levels last seen on the Level tab.
        useLevelSeenStore.getState().reset();
        useRankLiftStore.getState().reset();
        // Events after this belong to whoever uses the app next.
        resetAnalytics();
        // The next Google sign-in asks for the account again instead of reusing this one.
        signOutOfGoogle();
        return;
      }
      // Without a session only when it couldn't be confirmed yet (offline at launch): the saved
      // one stays until supabase-js signs out.
      if (!session) return;
      setSession(session);
      connectAccount(session.user.id);
    });
    return () => data.subscription.unsubscribe();
  }, [setSession]);
}
