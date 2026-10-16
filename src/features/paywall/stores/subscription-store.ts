import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from '@/shared/lib/storage';

import { type CustomerInfo, NO_PRO, purchases } from '../lib/purchases-service';

interface SubscriptionState extends CustomerInfo {
  /** The store answered at least once for this account; until then nothing is locked. */
  checked: boolean;
  /** Mirrors what the purchases service reported after a purchase or restore. */
  apply: (info: CustomerInfo) => void;
  reset: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      ...NO_PRO,
      checked: false,
      apply: ({ isPro, plan, trialEndsAt }) => set({ isPro, plan, trialEndsAt, checked: true }),
      reset: () => set({ ...NO_PRO, checked: false }),
    }),
    { name: 'subscription', storage: createJSONStorage(() => mmkvStorage) },
  ),
);

/** True while the user has Traqa Pro (trial or paid). */
export const useIsPro = () => useSubscriptionStore((s) => s.isPro);

/**
 * The whole app is Pro: once the store has confirmed there is no subscription (never bought, or
 * expired), the app is locked behind the paywall (see useSubscriptionGate for what stays open).
 * An unanswered check (a new device offline) locks nothing, so a subscriber is never shut out by
 * a missing connection.
 */
export const useIsLocked = () => useSubscriptionStore((s) => s.checked && !s.isPro);

/** Trial end as a Date while the trial is still running, else null. */
export function trialEnd(trialEndsAt: string | null, now = Date.now()) {
  if (!trialEndsAt) return null;
  const end = new Date(trialEndsAt);
  return end.getTime() > now ? end : null;
}

// Renewals, expiries and purchases on other devices while the app runs.
purchases.onChange((info) => useSubscriptionStore.getState().apply(info));

/**
 * Links purchases to the signed-in account and re-reads Pro on launch and after sign-in, so a
 * renewal or an expired subscription shows up without tapping Restore. Offline keeps the cached
 * state.
 */
export async function refreshSubscription(userId: string) {
  try {
    await purchases.setUser(userId);
    useSubscriptionStore.getState().apply(await purchases.getCustomerInfo());
  } catch (error) {
    console.warn('Refreshing the subscription failed', error);
  }
}
