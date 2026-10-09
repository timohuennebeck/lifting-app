import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useAccentColor } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';

import { TrialTimeline } from '../components/trial-timeline';
import { useOffering } from '../hooks/use-offering';
import { parsePlanId, usePaywallFlow } from '../hooks/use-paywall-flow';
import { usePurchase } from '../hooks/use-purchases';
import { formatPrice, TRIAL_DAYS } from '../lib/purchases-service';

/** The reminder goes out this many days before billing starts. */
const REMINDER_DAYS_BEFORE = 2;

/** Free-trial explainer: what happens today, at the reminder and when billing starts. */
export function TrialScreen() {
  const { t } = useTranslation(['paywall', 'common']);
  const accent = useAccentColor();
  const flow = usePaywallFlow();
  const planId = parsePlanId(useLocalSearchParams<{ plan?: string }>().plan);
  const { offering, plan, isError, isFetching, refetch } = useOffering();
  // Only a missing offering blocks buying; a failed background refresh keeps the cache.
  const failed = !offering && isError;
  const { buy, busy } = usePurchase();

  const selected = plan(planId);
  const period = selected?.period ?? (planId === 'monthly' ? 'month' : 'day');
  const price = selected && offering ? formatPrice(selected.price, offering.currency) : null;
  const days = offering?.trialDays ?? TRIAL_DAYS;

  const start = async () => {
    if (await buy(planId)) flow.toWelcome();
  };

  return (
    <Screen
      scroll
      footer={
        <View className="gap-2.5">
          <Button
            label={failed ? t('common:actions.retry') : t('trial.cta')}
            loading={busy || (!offering && (!isError || isFetching))}
            onPress={failed ? () => refetch() : start}
          />
          <Text variant="caption" tone="subtle" className="text-center font-inter text-xs">
            {price ? t(`trial.fine.${period}`, { price }) : ' '}
          </Text>
        </View>
      }
    >
      {/* Header scrolls with the content so the number's glow isn't clipped at the top. */}
      <ScreenHeader />
      <View className="items-center pt-2.5">
        <View
          className="size-42.5 items-center justify-center rounded-full bg-accent"
          style={{ boxShadow: `0 0 60px ${accent}73` }}
        >
          <Text tone="onAccent" className="font-inter-semibold text-[96px] leading-26">
            {days}
          </Text>
          <View className="absolute inset-x-0 items-center" style={{ bottom: -6 }}>
            <View
              className="rounded-full bg-pill px-3.5 py-2"
              style={{ transform: [{ rotate: '-4deg' }] }}
            >
              <Text variant="caption" className="tracking-[1px] uppercase">
                {t('trial.badge', { count: days })}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="items-center px-5.5 pt-5.5">
        <Text variant="title" className="text-center text-2xl leading-7">
          {t('trial.title')}
        </Text>
        <Text tone="muted" className="mt-2 text-center text-sm leading-5">
          {t('trial.subtitle')}
        </Text>
      </View>

      <View className="px-6.5 pt-6.5">
        <TrialTimeline
          steps={[
            { title: t('trial.today'), body: t('trial.todayBody') },
            {
              title: t('trial.day', { day: days - REMINDER_DAYS_BEFORE }),
              body: t('trial.reminderBody'),
            },
            { title: t('trial.day', { day: days }), body: t(`trial.startBody.${period}`) },
          ]}
        />
      </View>
    </Screen>
  );
}
