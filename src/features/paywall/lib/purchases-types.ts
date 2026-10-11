export type PlanId = 'monthly' | 'yearly';
type BillingPeriod = 'month' | 'year';

/** The plans in the order the paywall shows them. */
export const PLAN_IDS: PlanId[] = ['yearly', 'monthly'];
export const PERIOD_OF: Record<PlanId, BillingPeriod> = { monthly: 'month', yearly: 'year' };
/** Free-trial length shown while the offering loads. */
export const DEFAULT_TRIAL_DAYS = 7;

export interface Plan {
  id: PlanId;
  /** Price per period (PERIOD_OF) in the offering's currency. */
  price: number;
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
  /** ISO timestamp; set while the purchase started with a free trial. */
  trialEndsAt: string | null;
}

export const NO_PRO: CustomerInfo = { isPro: false, plan: null, trialEndsAt: null };

export interface PurchasesService {
  /** Ties purchases to the signed-in account, so Pro follows it to other devices; null signs out. */
  setUser(userId: string | null): Promise<void>;
  getCustomerInfo(): Promise<CustomerInfo>;
  getOfferings(): Promise<Offering>;
  /** Rejects with `PurchaseCancelledError` when the user closes the store's sheet. */
  purchase(planId: PlanId): Promise<CustomerInfo>;
  /** Rejects with `NothingToRestoreError` when the store account has no active purchase. */
  restore(): Promise<CustomerInfo>;
  /** Changes the store reports by itself: a renewal, an expiry, a purchase on another device. */
  onChange(listener: (info: CustomerInfo) => void): void;
}

export class NothingToRestoreError extends Error {
  constructor() {
    super('No purchases to restore');
    this.name = 'NothingToRestoreError';
  }
}

export class PurchaseCancelledError extends Error {
  constructor() {
    super('Purchase cancelled');
    this.name = 'PurchaseCancelledError';
  }
}
