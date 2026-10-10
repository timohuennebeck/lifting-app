import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import { paywallKeys } from '@/features/paywall/data/paywall-keys';
import {
  MANAGE_SUBSCRIPTIONS_URL,
  resetMockPurchases,
} from '@/features/paywall/lib/purchases-service';
import { trialEnd, useSubscriptionStore } from '@/features/paywall/stores/subscription-store';
import { formatShortDate } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';

import { SettingsRow, SettingsSection } from './settings-section';

/** "Abo verwalten" opens the store's subscription page; without Pro the row opens the paywall. */
export function ProSection() {
  const { t } = useTranslation('paywall');
  const queryClient = useQueryClient();
  const isPro = useSubscriptionStore((s) => s.isPro);
  const plan = useSubscriptionStore((s) => s.plan);
  const trialEndsAt = useSubscriptionStore((s) => s.trialEndsAt);

  const trialEndDate = trialEnd(trialEndsAt);
  const status = trialEndDate
    ? t('settings.trialUntil', { date: formatShortDate(trialEndDate) })
    : t(plan === 'monthly' ? 'settings.planMonthly' : 'settings.planDaily');

  // Purchases are mocked: a long press lets testers start over from the paywall.
  const resetForTesting = () => {
    resetMockPurchases();
    useSubscriptionStore.getState().reset();
    queryClient.invalidateQueries({ queryKey: paywallKeys.offering.queryKey });
  };

  return (
    <SettingsSection title={t('settings.section')}>
      {isPro ? (
        <SettingsRow
          first
          label={t('settings.manage')}
          value={status}
          trailing={<Icon name="arrow-up-right" size={14} color={colors.dim} />}
          onPress={() => Linking.openURL(MANAGE_SUBSCRIPTIONS_URL)}
          onLongPress={__DEV__ ? resetForTesting : undefined}
        />
      ) : (
        <SettingsRow
          first
          label={t('settings.title')}
          value={t('settings.upgrade')}
          onPress={() => router.push('/pro')}
        />
      )}
    </SettingsSection>
  );
}
