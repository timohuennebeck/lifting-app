import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { track } from '@/shared/lib/posthog';
import { haptics } from '@/shared/lib/haptics';

import { paywallKeys } from '../data/paywall-keys';
import {
  NothingToRestoreError,
  type PlanId,
  PurchaseCancelledError,
  purchases,
} from '../lib/purchases-service';
import { useSubscriptionStore } from '../stores/subscription-store';

/** Buys a plan through the purchases service and mirrors the result into the store. */
export function usePurchase() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  const buy = async (planId: PlanId) => {
    if (busy) return false;
    setBusy(true);
    let bought = false;
    try {
      const info = await purchases.purchase(planId);
      useSubscriptionStore.getState().apply(info);
      queryClient.invalidateQueries({ queryKey: paywallKeys.offering.queryKey });
      haptics.success();
      track('paywall:purchase_complete', { package: planId, has_trial: !!info.trialEndsAt });
      bought = true;
    } catch (error) {
      const cancelled = error instanceof PurchaseCancelledError;
      track('paywall:purchase_fail', {
        package: planId,
        error_code: error instanceof Error ? error.name : 'unknown',
        is_cancelled: cancelled,
      });
      // Closing the store's sheet isn't an error.
      if (!cancelled) {
        console.warn('Purchase failed', error);
        haptics.error();
        Alert.alert(t('errors.generic'));
      }
    }
    setBusy(false);
    return bought;
  };

  return { buy, busy };
}

/** "Restore purchases": resolves true when Traqa Pro is active again; alerts either way. */
export function useRestorePurchases() {
  const { t } = useTranslation('paywall');
  const { t: tc } = useTranslation();
  const queryClient = useQueryClient();
  const [restoring, setRestoring] = useState(false);

  const restore = async () => {
    if (restoring) return false;
    setRestoring(true);
    let restored = false;
    try {
      useSubscriptionStore.getState().apply(await purchases.restore());
      queryClient.invalidateQueries({ queryKey: paywallKeys.offering.queryKey });
      haptics.success();
      track('paywall:restore_complete');
      Alert.alert(t('restoreResult.successTitle'), t('restoreResult.successBody'));
      restored = true;
    } catch (error) {
      if (error instanceof NothingToRestoreError) {
        haptics.warning();
        Alert.alert(t('restoreResult.emptyTitle'), t('restoreResult.emptyBody'));
      } else {
        haptics.error();
        Alert.alert(tc('errors.generic'));
      }
    }
    setRestoring(false);
    return restored;
  };

  return { restore, restoring };
}
