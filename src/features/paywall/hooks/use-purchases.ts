import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { track } from '@/shared/lib/posthog';
import { haptics } from '@/shared/lib/haptics';
import { showError } from '@/shared/stores/error-sheet-store';

import { paywallKeys } from '../data/paywall-keys';
import {
  NothingToRestoreError,
  type PlanId,
  PurchaseCancelledError,
  purchases,
} from '../lib/purchases-service';
import { useSubscriptionStore } from '../stores/subscription-store';

/**
 * Buys a plan through the purchases service and mirrors the result into the store. `onBought`
 * runs once it went through, also after "Try again" in the error sheet.
 */
export function usePurchase(onBought: () => void) {
  const { t } = useTranslation('paywall');
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  const buy = async (planId: PlanId) => {
    if (busy) return;
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
        showError({
          title: t('errors.purchase.title'),
          message: t('errors.purchase.message'),
          onRetry: () => void buy(planId),
        });
      }
    }
    setBusy(false);
    if (bought) onBought();
  };

  return { buy, busy };
}

/**
 * "Restore purchases": `onRestored` runs when Loqqa Pro is active again. The outcome shows in an
 * alert, a failure in the error sheet.
 */
export function useRestorePurchases(onRestored: () => void) {
  const { t } = useTranslation('paywall');
  const queryClient = useQueryClient();
  const [restoring, setRestoring] = useState(false);

  const restore = async () => {
    if (restoring) return;
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
        showError({
          title: t('errors.restore.title'),
          message: t('errors.restore.message'),
          onRetry: () => void restore(),
        });
      }
    }
    setRestoring(false);
    if (restored) onRestored();
  };

  return { restore, restoring };
}
