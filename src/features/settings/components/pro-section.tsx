import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import { paywallKeys } from '@/features/paywall/data/paywall-keys';
import {
  MANAGE_SUBSCRIPTIONS_URL,
  resetMockPurchases,
  usesStore,
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
    : t(plan === 'monthly' ? 'settings.planMonthly' : 'settings.planYearly');

  // While purchases are simulated, a long press lets testers start over from the paywall.
  const resetForTesting = () => {
    resetMockPurchases();
    useSubscriptionStore.getState().reset();
    queryClient.invalidateQueries({ queryKey: paywallKeys.offering.queryKey });
  };

  return (
    <SettingsSection title={t('settings.section')}>
      {isPro ? (
        <SettingsRow
          label={t('settings.manage')}
          value={status}
          trailing={<Icon name="arrow-up-right" size={14} color={colors.dim} />}
          onPress={() => Linking.openURL(MANAGE_SUBSCRIPTIONS_URL)}
          onLongPress={__DEV__ && !usesStore ? resetForTesting : undefined}
        />
      ) : (
        <SettingsRow
          label={t('settings.title')}
          value={t('settings.upgrade')}
          // Back to the paywall when it is already open below (a locked app), else opens it.
          onPress={() => router.navigate('/pro')}
        />
      )}
    </SettingsSection>
  );
}
