import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from '@/shared/lib/storage';

import {
  type CustomerInfo,
  NothingToRestoreError,
  type PlanId,
  purchases,
} from '../lib/purchases-service';

interface SubscriptionState {
  isPro: boolean;
  plan: PlanId | null;
  /** ISO timestamp; set while the purchase started with a free trial. */
  trialEndsAt: string | null;
  purchasedAt: string | null;
  /** Mirrors what the purchases service reported after a purchase or restore. */
  apply: (info: CustomerInfo) => void;
  reset: () => void;
}

const empty = { isPro: false, plan: null, trialEndsAt: null, purchasedAt: null };

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      ...empty,
      apply: ({ isPro, plan, trialEndsAt, purchasedAt }) =>
        set({ isPro, plan, trialEndsAt, purchasedAt }),
      reset: () => set(empty),
    }),
    { name: 'subscription', storage: createJSONStorage(() => mmkvStorage) },
  ),
);

/** True while the user has Forge Pro (trial or paid). */
export const useIsPro = () => useSubscriptionStore((s) => s.isPro);

/** Trial end as a Date while the trial is still running, else null. */
export function trialEnd(trialEndsAt: string | null, now = Date.now()) {
  if (!trialEndsAt) return null;
  const end = new Date(trialEndsAt);
  return end.getTime() > now ? end : null;
}

/**
 * Re-reads Pro from the store account after sign-in and on launch, so a renewal or an
 * expired subscription shows up without tapping Restore. Offline keeps the cached state.
 */
export async function refreshSubscription() {
  try {
    useSubscriptionStore.getState().apply(await purchases.restore());
  } catch (error) {
    if (error instanceof NothingToRestoreError) useSubscriptionStore.getState().reset();
  }
}
