import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFooterInset } from '@/shared/hooks/use-footer-inset';
import { Button } from '@/shared/ui/button';
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
import { formatPrice, type PlanId } from '../lib/purchases-service';
import { useIsPro } from '../stores/subscription-store';

const BENEFITS = ['import', 'history', 'suggestions'] as const;
const PLAN_IDS: PlanId[] = ['daily', 'monthly'];

/** Forge Pro paywall: before/after header, benefits, plan picker. */
export function PaywallScreen() {
  const { t } = useTranslation(['paywall', 'common']);
  const insets = useSafeAreaInsets();
  const footerInset = useFooterInset();
  const flow = usePaywallFlow();
  const isPro = useIsPro();
  const { offering, plan, isError, refetch } = useOffering();
  const { buy, busy } = usePurchase();
  const { restore, restoring } = useRestorePurchases();
  const [selected, setSelected] = useState<PlanId>('daily');

  const priceOf = (id: PlanId) => {
    const p = plan(id);
    return p && offering ? formatPrice(p.price, offering.currency) : null;
  };
  const current = plan(selected);
  const price = priceOf(selected);

  const onContinue = async () => {
    if (isPro) return flow.exit();
    if (!offering) return;
    if (offering.trialEligible) return flow.toTrial(selected);
    if (await buy(selected)) flow.toWelcome();
  };

  const onRestore = async () => {
    if (await restore()) flow.exit();
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
          icon="close"
          onBack={flow.exit}
          action={
            <TextButton
              label={restoring ? t('restoring') : t('restore')}
              tone="muted"
              disabled={restoring || busy}
              className="px-0"
              textClassName="font-inter-medium text-sm"
              onPress={onRestore}
            />
          }
        />
        <View className="px-5 pt-2.5">
          <BeforeAfter />
        </View>

        <View className="items-center px-6 pt-7">
          <Text variant="headline" className="text-[34px] leading-9.5">
            {t('paywall.brand')}{' '}
            <Text variant="headline" tone="accent" className="text-[34px] leading-9.5">
              {t('paywall.pro')}
            </Text>
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
                note={t(`plans.${id}.note`)}
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
          label={isError ? t('common:actions.retry') : t('paywall.continue')}
          loading={busy || (!offering && !isError)}
          disabled={restoring}
          onPress={isError ? () => refetch() : onContinue}
        />
        <Text variant="caption" tone="subtle" className="text-center font-inter text-xs">
          {current && price
            ? t(
                offering?.trialEligible
                  ? `paywall.fine.${current.period}`
                  : `paywall.fineNoTrial.${current.period}`,
                { price },
              )
            : ' '}
        </Text>
      </View>
    </View>
  );
}
