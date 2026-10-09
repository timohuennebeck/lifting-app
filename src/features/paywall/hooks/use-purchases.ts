import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { haptics } from '@/shared/lib/haptics';

import { NothingToRestoreError, type PlanId, purchases } from '../lib/purchases-service';
import { useSubscriptionStore } from '../stores/subscription-store';
import { paywallKeys } from './use-offering';

/** Buys a plan through the purchases service and mirrors the result into the store. */
export function usePurchase() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  const buy = async (planId: PlanId) => {
    if (busy) return false;
    setBusy(true);
    try {
      useSubscriptionStore.getState().apply(await purchases.purchase(planId));
      queryClient.invalidateQueries({ queryKey: paywallKeys.offering.queryKey });
      haptics.success();
      return true;
    } catch {
      haptics.error();
      Alert.alert(t('errors.generic'));
      return false;
    } finally {
      setBusy(false);
    }
  };

  return { buy, busy };
}

/** "Restore purchases": resolves true when Forge Pro is active again; alerts either way. */
export function useRestorePurchases() {
  const { t } = useTranslation('paywall');
  const { t: tc } = useTranslation();
  const queryClient = useQueryClient();
  const [restoring, setRestoring] = useState(false);

  const restore = async () => {
    if (restoring) return false;
    setRestoring(true);
    try {
      useSubscriptionStore.getState().apply(await purchases.restore());
      queryClient.invalidateQueries({ queryKey: paywallKeys.offering.queryKey });
      haptics.success();
      Alert.alert(t('restoreResult.successTitle'), t('restoreResult.successBody'));
      return true;
    } catch (error) {
      if (error instanceof NothingToRestoreError) {
        haptics.warning();
        Alert.alert(t('restoreResult.emptyTitle'), t('restoreResult.emptyBody'));
      } else {
        haptics.error();
        Alert.alert(tc('errors.generic'));
      }
      return false;
    } finally {
      setRestoring(false);
    }
  };

  return { restore, restoring };
}
