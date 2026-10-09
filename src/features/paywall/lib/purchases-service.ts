import { Platform } from 'react-native';

import { i18n } from '@/shared/i18n';
import { DAY_MS } from '@/shared/lib/date';
import { storage } from '@/shared/lib/storage';

export type PlanId = 'daily' | 'monthly';
export type BillingPeriod = 'day' | 'month';

export interface Plan {
  id: PlanId;
  /** Price per period in the offering's currency. */
  price: number;
  period: BillingPeriod;
}

export interface Offering {
  /** ISO 4217 code, e.g. "EUR". */
  currency: string;
  plans: Plan[];
  trialDays: number;
  /** False once this store account already used its free trial. */
  trialEligible: boolean;
}

/** Entitlement state as the store reports it (RevenueCat: CustomerInfo). */
export interface CustomerInfo {
  isPro: boolean;
  plan: PlanId | null;
  trialEndsAt: string | null;
  purchasedAt: string | null;
}

export interface PurchasesService {
  getOfferings(): Promise<Offering>;
  purchase(planId: PlanId): Promise<CustomerInfo>;
  /** Rejects with `NothingToRestoreError` when the store account has no active purchase. */
  restore(): Promise<CustomerInfo>;
}

export class NothingToRestoreError extends Error {
  constructor() {
    super('No purchases to restore');
    this.name = 'NothingToRestoreError';
  }
}

const PLANS: Plan[] = [
  { id: 'daily', price: 0.99, period: 'day' },
  { id: 'monthly', price: 9.99, period: 'month' },
];
const TRIAL_DAYS = 7;

// The mock "store account" lives in MMKV so restore works across sessions and sign-outs.
const RECEIPT_KEY = 'purchases.mock.receipt';
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function readReceipt(): CustomerInfo | null {
  const raw = storage.getString(RECEIPT_KEY);
  return raw ? (JSON.parse(raw) as CustomerInfo) : null;
}

/** Deterministic stand-in for RevenueCat: every purchase succeeds and auto-renews. */
function createMockPurchases(): PurchasesService {
  return {
    async getOfferings() {
      await wait(350);
      return {
        currency: 'EUR',
        plans: PLANS,
        trialDays: TRIAL_DAYS,
        trialEligible: !readReceipt(),
      };
    },
    async purchase(planId) {
      await wait(1200);
      const now = Date.now();
      const trial = !readReceipt();
      const info: CustomerInfo = {
        isPro: true,
        plan: planId,
        trialEndsAt: trial ? new Date(now + TRIAL_DAYS * DAY_MS).toISOString() : null,
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
  };
}

export const purchases: PurchasesService = createMockPurchases();

/** Test helper: forgets the mock store account so the trial can be tried again. */
export function resetMockPurchases() {
  storage.remove(RECEIPT_KEY);
}

/** Where users cancel or change their plan (RevenueCat: CustomerInfo.managementURL). */
export const MANAGE_SUBSCRIPTIONS_URL = Platform.select({
  ios: 'https://apps.apple.com/account/subscriptions',
  default: 'https://play.google.com/store/account/subscriptions',
});

const priceFormats = new Map<string, Intl.NumberFormat>();

/** Localized price in the offering's currency, e.g. "0,99 €" (de) or "€0.99" (en). */
export function formatPrice(amount: number, currency: string) {
  const key = `${i18n.language}|${currency}`;
  let format = priceFormats.get(key);
  if (!format) {
    format = new Intl.NumberFormat(i18n.language, { style: 'currency', currency });
    priceFormats.set(key, format);
  }
  return format.format(amount);
}
