import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, type AlertButton, Linking } from 'react-native';

import { paywallKeys } from '@/features/paywall/hooks/use-offering';
import { useRestorePurchases } from '@/features/paywall/hooks/use-purchases';
import {
  MANAGE_SUBSCRIPTIONS_URL,
  resetMockPurchases,
} from '@/features/paywall/lib/purchases-service';
import { trialEnd, useSubscriptionStore } from '@/features/paywall/stores/subscription-store';
import { formatDate, formatShortDate } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';

import { SettingsRow, SettingsSection } from './settings-section';

const LONG_DATE = { day: 'numeric', month: 'long', year: 'numeric' } as const;

/** Forge Pro status (opens the paywall or the plan details) plus "Restore purchases". */
export function ProSection() {
  const { t } = useTranslation('paywall');
  const { t: tc } = useTranslation();
  const queryClient = useQueryClient();
  const isPro = useSubscriptionStore((s) => s.isPro);
  const plan = useSubscriptionStore((s) => s.plan);
  const trialEndsAt = useSubscriptionStore((s) => s.trialEndsAt);
  const purchasedAt = useSubscriptionStore((s) => s.purchasedAt);
  const { restore, restoring } = useRestorePurchases();

  const trialEndDate = trialEnd(trialEndsAt);
  const period = plan === 'monthly' ? 'month' : 'day';
  const status = !isPro
    ? t('settings.upgrade')
    : trialEndDate
      ? t('settings.trialUntil', { date: formatShortDate(trialEndDate) })
      : t('settings.active');

  const resetForTesting = () => {
    resetMockPurchases();
    useSubscriptionStore.getState().reset();
    queryClient.invalidateQueries({ queryKey: paywallKeys.offering.queryKey });
  };

  const showDetails = () => {
    const body = trialEndDate
      ? t(`settings.details.trial.${period}`, { date: formatDate(trialEndDate, LONG_DATE) })
      : t(`settings.details.active.${period}`, {
          date: formatDate(new Date(purchasedAt ?? Date.now()), LONG_DATE),
        });
    const buttons: AlertButton[] = [
      { text: t('settings.manage'), onPress: () => Linking.openURL(MANAGE_SUBSCRIPTIONS_URL) },
      { text: tc('actions.done'), style: 'cancel' },
    ];
    // Purchases are mocked: let testers start over from the paywall.
    if (__DEV__)
      buttons.unshift({
        text: t('settings.reset'),
        style: 'destructive',
        onPress: resetForTesting,
      });
    Alert.alert(t('settings.title'), body, buttons);
  };

  return (
    <SettingsSection title={t('settings.section')}>
      <SettingsRow
        first
        label={t('settings.title')}
        value={status}
        onPress={isPro ? showDetails : () => router.push('/pro')}
      />
      <SettingsRow
        label={t('settings.restore')}
        trailing={restoring ? <ActivityIndicator size="small" color={colors.muted} /> : undefined}
        onPress={restore}
      />
    </SettingsSection>
  );
}
