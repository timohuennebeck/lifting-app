import { Platform } from 'react-native';

import { env } from '@/shared/config/env';
import { i18n } from '@/shared/i18n';
import { getOrInsert } from '@/shared/lib/map';

import { createMockPurchases } from './mock-purchases';
import type { Offering, PurchasesService } from './purchases-types';
import { createRevenueCatPurchases } from './revenuecat-purchases';

export * from './purchases-types';
export { resetMockPurchases } from './mock-purchases';

const revenueCatKey = Platform.select({ ios: env.revenueCatIosKey });

/** Real purchases through RevenueCat where its key is set (iOS for now), else simulated. */
export const usesStore = !!revenueCatKey;
export const purchases: PurchasesService = revenueCatKey
  ? createRevenueCatPurchases(revenueCatKey)
  : createMockPurchases();

/** Where users cancel or change their plan (RevenueCat: CustomerInfo.managementURL). */
export const MANAGE_SUBSCRIPTIONS_URL = Platform.select({
  ios: 'https://apps.apple.com/account/subscriptions',
  default: 'https://play.google.com/store/account/subscriptions',
});

const priceFormats = new Map<string, Intl.NumberFormat>();

/** Localized price in the offering's currency, e.g. "0,99 €" (de) or "€0.99" (en). */
export function formatPrice(amount: number, currency: string) {
  const format = getOrInsert(
    priceFormats,
    `${i18n.language}|${currency}`,
    () => new Intl.NumberFormat(i18n.language, { style: 'currency', currency }),
  );
  return format.format(amount);
}

/** Percent the yearly plan saves against paying monthly for a year, e.g. 50; null without both. */
export function yearlySavings(offering: Offering) {
  const yearly = offering.plans.find((p) => p.id === 'yearly');
  const monthly = offering.plans.find((p) => p.id === 'monthly');
  if (!yearly || !monthly?.price) return null;
  return Math.round((1 - yearly.price / (monthly.price * 12)) * 100);
}
