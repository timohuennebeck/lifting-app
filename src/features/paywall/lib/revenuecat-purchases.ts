import { Platform } from 'react-native';
import Purchases, {
  type CustomerInfo as StoreCustomerInfo,
  INTRO_ELIGIBILITY_STATUS,
  PURCHASES_ERROR_CODE,
  type PurchasesOffering,
  type PurchasesStoreProduct,
} from 'react-native-purchases';

import {
  type CustomerInfo,
  NO_PRO,
  NothingToRestoreError,
  PLAN_IDS,
  type PlanId,
  PurchaseCancelledError,
  type PurchasesService,
} from './purchases-types';

/** RevenueCat entitlement that unlocks Traqa Pro. */
const ENTITLEMENT = 'pro';
/** Store product per plan, as set up in App Store Connect and RevenueCat (README). */
const PRODUCT_IDS: Record<PlanId, string> = {
  monthly: 'traqa_pro_monthly',
  yearly: 'traqa_pro_yearly',
};
const DAYS_PER_UNIT: Record<string, number> = { DAY: 1, WEEK: 7, MONTH: 30, YEAR: 365 };

const planOfProduct = (productId: string) =>
  PLAN_IDS.find((id) => productId.startsWith(PRODUCT_IDS[id])) ?? null;

/** The offering's package for a plan: RevenueCat's standard monthly and annual packages. */
const packageOf = (offering: PurchasesOffering, planId: PlanId) =>
  planId === 'monthly' ? offering.monthly : offering.annual;

/** Length of a free trial in days; 0 without one (a paid intro offer isn't a trial). */
function trialDaysOf(product: PurchasesStoreProduct) {
  const intro = product.introPrice;
  if (!intro || intro.price > 0) return 0;
  return (DAYS_PER_UNIT[intro.periodUnit] ?? 0) * intro.periodNumberOfUnits * intro.cycles;
}

function toCustomerInfo(info: StoreCustomerInfo): CustomerInfo {
  const pro = info.entitlements.active[ENTITLEMENT];
  if (!pro) return NO_PRO;
  return {
    isPro: true,
    plan: planOfProduct(pro.productIdentifier),
    trialEndsAt: pro.periodType === 'TRIAL' ? pro.expirationDate : null,
  };
}

const isCancel = (error: unknown) => {
  const { code, userCancelled } = (error ?? {}) as { code?: string; userCancelled?: boolean };
  return userCancelled === true || code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
};

/** Real purchases through RevenueCat. The SDK is set up on first use, with the account if known. */
export function createRevenueCatPurchases(apiKey: string): PurchasesService {
  const listeners = new Set<(info: CustomerInfo) => void>();
  let configured = false;

  const configure = (appUserID: string | null = null) => {
    if (configured) return;
    Purchases.configure({ apiKey, appUserID });
    Purchases.addCustomerInfoUpdateListener((info) => {
      const mapped = toCustomerInfo(info);
      listeners.forEach((listener) => listener(mapped));
    });
    configured = true;
  };

  const currentOffering = async () => {
    configure();
    const { current } = await Purchases.getOfferings();
    if (!current) throw new Error('RevenueCat has no current offering');
    return current;
  };

  return {
    async setUser(userId) {
      if (!configured) {
        if (userId) configure(userId);
        return;
      }
      // Logging in also moves purchases made before sign-up (during onboarding) to the account.
      if (userId) await Purchases.logIn(userId);
      else if (!(await Purchases.isAnonymous())) await Purchases.logOut();
    },
    async getCustomerInfo() {
      configure();
      return toCustomerInfo(await Purchases.getCustomerInfo());
    },
    async getOfferings() {
      const offering = await currentOffering();
      const plans = PLAN_IDS.flatMap((id) => {
        const product = packageOf(offering, id)?.product;
        return product ? [{ id, product }] : [];
      });
      if (!plans.length) throw new Error('The current offering has no monthly or annual package');
      const products = plans.map((p) => p.product);
      const trialDays = Math.max(...products.map(trialDaysOf));
      let trialEligible = trialDays > 0;
      // Only the App Store says beforehand whether this account already had the trial.
      if (trialEligible && Platform.OS === 'ios') {
        const eligibility = await Purchases.checkTrialOrIntroductoryPriceEligibility(
          products.map((p) => p.identifier),
        );
        trialEligible = Object.values(eligibility).some(
          (e) => e.status !== INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_INELIGIBLE,
        );
      }
      return {
        currency: products[0].currencyCode,
        plans: plans.map(({ id, product }) => ({ id, price: product.price })),
        trialDays,
        trialEligible,
      };
    },
    async purchase(planId) {
      const pkg = packageOf(await currentOffering(), planId);
      if (!pkg) throw new Error(`The current offering has no ${planId} package`);
      try {
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        return toCustomerInfo(customerInfo);
      } catch (error) {
        if (isCancel(error)) throw new PurchaseCancelledError();
        throw error;
      }
    },
    async restore() {
      configure();
      const info = toCustomerInfo(await Purchases.restorePurchases());
      if (!info.isPro) throw new NothingToRestoreError();
      return info;
    },
    onChange(listener) {
      listeners.add(listener);
    },
  };
}
