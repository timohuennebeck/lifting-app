import { router, useNavigation, useSegments } from 'expo-router';

import type { PlanId } from '../lib/purchases-service';

/** The plan travels between paywall steps as a route param. */
export const parsePlanId = (value: unknown): PlanId => (value === 'monthly' ? 'monthly' : 'daily');

/**
 * The same screens run in onboarding (/paywall → /create-account) and as the
 * Forge Pro modal from Settings (/pro, closed back to where it was opened).
 */
export function usePaywallFlow() {
  const segments = useSegments();
  const navigation = useNavigation();
  const inApp = segments[0] === '(app)';

  return {
    toTrial: (plan: PlanId) =>
      router.push({ pathname: inApp ? '/pro/trial' : '/paywall/trial', params: { plan } }),
    /** After a purchase: the thank-you screen replaces the paywall step. */
    toWelcome: () => router.replace(inApp ? '/pro/welcome' : '/paywall/welcome'),
    /** Leaves the flow: next onboarding step, or dismiss the whole modal. */
    exit: () => {
      if (!inApp) router.push('/create-account');
      else if (navigation.getParent()?.canGoBack()) navigation.getParent()?.goBack();
      else router.back();
    },
  };
}
