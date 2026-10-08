import { useEffect } from 'react';

import { useOnboardingStore } from '@/features/onboarding/stores/onboarding-store';
import { useWorkoutSessionStore } from '@/features/workout/stores/workout-session-store';
import { connector, db } from '@/shared/data/powersync/database';
import { queryClient } from '@/shared/data/query-client';
import { supabase } from '@/shared/data/supabase';

import { useSessionStore } from '@/shared/stores/session-store';

/** Mirrors Supabase auth into the session store and (dis)connects PowerSync. */
export function useAuthListener() {
  const setSession = useSessionStore((s) => s.setSession);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      // connect() tears down and reopens the stream, so skip token refreshes and
      // profile updates; the connector fetches fresh tokens on its own.
      if (session && (event === 'INITIAL_SESSION' || event === 'SIGNED_IN')) {
        db.connect(connector);
      } else if (event === 'SIGNED_OUT') {
        db.disconnectAndClear();
        queryClient.clear();
        // A later sign-in must check the new account's onboarding state again.
        useOnboardingStore.getState().reset();
        // Drop the previous account's running-workout UI state (rest timer, exercise index).
        useWorkoutSessionStore.getState().reset();
      }
    });
    return () => data.subscription.unsubscribe();
  }, [setSession]);
}
