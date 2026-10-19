import { useSegments } from 'expo-router';
import { useEffect } from 'react';

import { trackScreen } from '@/shared/lib/posthog';

/** Sends a screen view to PostHog whenever the route changes (expo-router has no automatic one). */
export function useScreenTracking() {
  const route = useSegments().join('/');
  useEffect(() => {
    trackScreen(route.split('/'));
  }, [route]);
}
