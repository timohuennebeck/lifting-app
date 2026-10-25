import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LegalLinks } from '@/features/legal/components/legal-link';
import { useFooterInset } from '@/shared/hooks/use-footer-inset';
import { track } from '@/shared/lib/posthog';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';
import { CheckItem } from '@/shared/ui/check-item';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';
import { TextButton } from '@/shared/ui/text-button';

import { FadeEdge, TopGlow } from '../components/backdrop';
import { BeforeAfter } from '../components/before-after';
import { PlanCard } from '../components/plan-card';
import { useOffering } from '../hooks/use-offering';
import { usePaywallFlow } from '../hooks/use-paywall-flow';
import { usePurchase, useRestorePurchases } from '../hooks/use-purchases';
import {
  formatPrice,
  PERIOD_OF,
  PLAN_IDS,
  type PlanId,
  yearlySavings,
} from '../lib/purchases-service';
import { useIsPro } from '../stores/subscription-store';

const BENEFITS = ['import', 'history', 'levels'] as const;

/** Loqqa Pro paywall: before/after header, benefits, plan picker. */
export function PaywallScreen() {
  const { t, i18n } = useTranslation(['paywall', 'common']);
  const insets = useSafeAreaInsets();
  const footerInset = useFooterInset();
  const flow = usePaywallFlow();
  // Counted once per showing, where it first showed (a purchase changes `locked`).
  const [placement] = useState(flow.placement);
  useEffect(() => {
    track('paywall:view', { placement });
  }, [placement]);
  const isPro = useIsPro();
  const { offering, plan, priceOf, failed, loading, refetch } = useOffering();
  const { buy, busy } = usePurchase(flow.toThankYou);
  const { restore, restoring } = useRestorePurchases(flow.exit);
  const [selected, setSelected] = useState<PlanId>('yearly');

  const price = priceOf(selected);
  const period = PERIOD_OF[selected];
  // The free trial is part of the purchase: the store starts it when the account may have one.
  const trial = !!offering?.trialEligible;
  const yearly = plan('yearly');
  const savings = offering ? yearlySavings(offering) : null;
  // The yearly plan's price per month, for its small print.
  const perMonth = yearly && offering ? formatPrice(yearly.price / 12, offering.currency) : null;

  const onContinue = () => {
    if (isPro) return flow.exit();
    if (offering) void buy(selected);
  };

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <TopGlow />
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-7"
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          // Onboarding and a locked app go on only with a plan (or a restored one); from
          // Settings it closes. Locked, Settings stays reachable for the account.
          icon={flow.closable ? 'close' : null}
          onBack={flow.exit}
          leading={
            flow.locked ? (
              <IconButton
                icon="settings"
                accessibilityLabel={t('common:settings')}
                onPress={() => router.push('/settings')}
              />
            ) : undefined
          }
          action={
            <TextButton
              label={restoring ? t('restoring') : t('restore')}
              tone="muted"
              disabled={restoring || busy}
              className="px-0"
              textClassName="font-inter-medium text-sm"
              onPress={() => void restore()}
            />
          }
        />
        <View className="px-5 pt-2.5">
          {/* Its dates are formatted once; a language switch from Settings redraws them. */}
          <BeforeAfter key={i18n.language} />
        </View>

        <View className="items-center px-6 pt-7">
          <Text variant="headline" className="text-center text-[34px] leading-9.5">
            <Trans
              t={t}
              i18nKey="paywall.title"
              components={{
                accent: (
                  <Text variant="headline" tone="accent" className="text-[34px] leading-9.5" />
                ),
              }}
            />
          </Text>
          <Text tone="muted" className="mt-2.5 text-center text-[15px] leading-5.5">
            {t('paywall.subtitle')}
          </Text>
        </View>

        <View className="gap-3.5 px-7 pt-6">
          {BENEFITS.map((key) => (
            <CheckItem key={key}>
              {t(`paywall.benefits.${key}.title`)}{' '}
              <Text tone="subtle" className="text-[15px]">
                {t(`paywall.benefits.${key}.detail`)}
              </Text>
            </CheckItem>
          ))}
        </View>

        <View className="flex-row gap-3 px-5 pt-6.5">
          {PLAN_IDS.map((id) => {
            const p = priceOf(id);
            return (
              <PlanCard
                key={id}
                label={t(`plans.${id}.label`)}
                price={p ? t(`plans.${id}.price`, { price: p }) : null}
                note={
                  id === 'yearly' && savings
                    ? t('plans.yearly.savings', { percent: savings })
                    : t(`plans.${id}.note`)
                }
                selected={selected === id}
                onPress={() => setSelected(id)}
              />
            );
          })}
        </View>
      </ScrollView>

      <View className="gap-3 bg-bg px-5" style={{ paddingBottom: footerInset }}>
        <FadeEdge />
        {/* Without an offering there is nothing to buy; let the user load it again. */}
        <Button
          label={
            failed
              ? t('common:actions.retry')
              : t(trial ? 'paywall.startTrial' : 'paywall.continue')
          }
          loading={busy || loading}
          disabled={restoring}
          onPress={failed ? () => refetch() : onContinue}
        />
        <Text variant="caption" tone="subtle" className="text-center font-inter text-xs">
          {price
            ? t(trial ? `paywall.fine.${period}` : `paywall.fineNoTrial.${period}`, {
                price,
                perMonth,
                trial: t('paywall.trialDays', { count: offering?.trialDays ?? 0 }),
              })
            : ' '}
        </Text>
        <LegalLinks />
      </View>
    </View>
  );
}
