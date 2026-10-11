import { wait } from '@/shared/lib/async';
import { DAY_MS } from '@/shared/lib/date';
import { storage } from '@/shared/lib/storage';

import {
  type CustomerInfo,
  DEFAULT_TRIAL_DAYS,
  NO_PRO,
  NothingToRestoreError,
  type Plan,
  type PurchasesService,
} from './purchases-types';

const PLANS: Plan[] = [
  { id: 'yearly', price: 59.99, period: 'year' },
  { id: 'monthly', price: 9.99, period: 'month' },
];

// The mock "store account" lives in MMKV so restore works across sessions and sign-outs.
const RECEIPT_KEY = 'purchases.mock.receipt';

function readReceipt(): CustomerInfo | null {
  const raw = storage.getString(RECEIPT_KEY);
  return raw ? (JSON.parse(raw) as CustomerInfo) : null;
}

/**
 * Stand-in for RevenueCat where it isn't set up (no API key, Android for now, the web preview):
 * every purchase succeeds and auto-renews. Only in development builds: a release build without
 * RevenueCat must not hand out Pro for free.
 */
export function createMockPurchases(): PurchasesService {
  return {
    async setUser() {},
    async getCustomerInfo() {
      return readReceipt() ?? NO_PRO;
    },
    async getOfferings() {
      await wait(350);
      return {
        currency: 'EUR',
        plans: PLANS,
        trialDays: DEFAULT_TRIAL_DAYS,
        trialEligible: !readReceipt(),
      };
    },
    async purchase(planId) {
      if (!__DEV__) throw new Error('Purchases are not set up in this build');
      await wait(1200);
      const now = Date.now();
      const trial = !readReceipt();
      const info: CustomerInfo = {
        isPro: true,
        plan: planId,
        trialEndsAt: trial ? new Date(now + DEFAULT_TRIAL_DAYS * DAY_MS).toISOString() : null,
        purchasedAt: new Date(now).toISOString(),
      };
      storage.set(RECEIPT_KEY, JSON.stringify(info));
      return info;
    },
    async restore() {
      await wait(900);
      const receipt = readReceipt();
      if (!receipt) throw new NothingToRestoreError();
      return receipt;
    },
    onChange() {},
  };
}

/** Test helper: forgets the mock store account so the trial can be tried again. */
export function resetMockPurchases() {
  storage.remove(RECEIPT_KEY);
}
