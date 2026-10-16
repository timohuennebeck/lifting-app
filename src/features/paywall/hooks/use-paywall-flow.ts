import { router, useNavigation, useSegments } from 'expo-router';
import { useState } from 'react';

import type { PlanId } from '../lib/purchases-service';
import { useIsLocked } from '../stores/subscription-store';

/** The plan travels between paywall steps as a route param. */
export const parsePlanId = (value: unknown): PlanId => (value === 'monthly' ? 'monthly' : 'yearly');

/**
 * The same screens run in onboarding (/paywall → /create-account), as the Traqa Pro modal from
 * Settings (/pro, closed back to where it was opened) and in front of a locked app (/pro, which
 * opens the app once there is a plan).
 */
export function usePaywallFlow() {
  const segments = useSegments();
  const navigation = useNavigation();
  // Taken when the screen mounts: the segments are global, and a page pushed on top (Terms,
  // Privacy) would otherwise turn this paywall into the onboarding one while it is still shown.
  const [inApp] = useState(segments[0] === '(app)');
  const locked = useIsLocked();

  return {
    /** Opened from Settings: closes. Onboarding and a locked app go on only with a plan. */
    closable: inApp && !locked,
    /** In front of the app because the subscription ran out (Settings stays reachable). */
    locked: inApp && locked,
    toTrial: (plan: PlanId) =>
      router.push({ pathname: inApp ? '/pro/trial' : '/paywall/trial', params: { plan } }),
    /** After a purchase: the thank-you screen replaces the paywall step. */
    toThankYou: () => router.replace(inApp ? '/pro/welcome' : '/paywall/welcome'),
    /** Leaves the flow: next onboarding step, or dismiss the whole modal. */
    exit: () => {
      if (!inApp) router.push('/create-account');
      else if (navigation.getParent()?.canGoBack()) navigation.getParent()?.goBack();
      // Shown in place of the app (locked): the app opens behind it.
      else router.replace('/');
    },
  };
}
