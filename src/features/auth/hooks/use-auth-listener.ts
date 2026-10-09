import { useEffect } from 'react';

import { clearLocalPhotos } from '@/features/body-check/lib/photo-files';
import { useBodyCheckStore } from '@/features/body-check/stores/body-check-store';
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding-store';
import {
  refreshSubscription,
  useSubscriptionStore,
} from '@/features/paywall/stores/subscription-store';
import { clearLocalAttachments } from '@/features/support/data/attachments';
import { useUploadQueueStore } from '@/features/support/stores/upload-queue-store';
import { useWorkoutSessionStore } from '@/features/workout/stores/workout-session-store';
import { connector, db } from '@/shared/data/powersync/database';
import { queryClient } from '@/shared/data/query-client';
import { supabase } from '@/shared/data/supabase';
import { useSessionStore } from '@/shared/stores/session-store';

/** Mirrors Supabase auth into the session store and (dis)connects PowerSync. */
export function useAuthListener() {
  const setSession = useSessionStore((s) => s.setSession);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      // connect() tears down and reopens the stream, so skip token refreshes and
      // profile updates; the connector fetches fresh tokens on its own.
      if (session && (event === 'INITIAL_SESSION' || event === 'SIGNED_IN')) {
        db.connect(connector);
        refreshSubscription();
      } else if (event === 'SIGNED_OUT') {
        db.disconnectAndClear();
        queryClient.clear();
        // A later sign-in must check the new account's onboarding state again.
        useOnboardingStore.getState().reset();
        // Drop the previous account's running-workout UI state (rest timer, exercise index).
        useWorkoutSessionStore.getState().reset();
        // Pro belongs to the account; the next one restores its own purchases.
        useSubscriptionStore.getState().reset();
        // Screenshot copies are private to the account (and would sit in device backups).
        useUploadQueueStore.getState().reset();
        clearLocalAttachments();
        // Body-check photos are just as private.
        useBodyCheckStore.getState().discard();
        clearLocalPhotos();
      }
    });
    return () => data.subscription.unsubscribe();
  }, [setSession]);
}
