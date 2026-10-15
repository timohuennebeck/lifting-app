import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useUnits } from '@/shared/data/profile';
import { useWeightEntries } from '@/shared/data/weight-entries';
import { useToday } from '@/shared/hooks/use-today';
import { toIsoDate } from '@/shared/lib/date';
import { Button } from '@/shared/ui/button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { formatKg } from '../lib/format';
import { trendChange, withTrend } from '../lib/trend';
import { TrendChangeRow } from './trend-change-row';

/** Days the card's change and sparkline cover. */
const CHANGE_DAYS = 30;

// The day at the tap: the card stays mounted overnight.
const openEntry = () =>
  router.push({ pathname: '/body-weight/[date]', params: { date: toIsoDate(new Date()) } });

/**
 * Weight at the top of Fortschritt → Körper: the trend now and how it moved over the last 30
 * days; opens the history (with its calendar), "Eintragen" today's weigh-in.
 */
export function WeightCard() {
  const { t } = useTranslation(['weight', 'common']);
  const units = useUnits();
  const unit = t(`common:units.${units === 'imperial' ? 'lb' : 'kg'}`);
  const { entries, isLoading } = useWeightEntries();
  const today = toIsoDate(new Date(useToday()));
  const points = withTrend(entries);
  const latest = points.at(-1);
  const change = trendChange(points, today, CHANGE_DAYS);
  if (isLoading) return null;

  const open = () => (latest ? router.push('/body-weight') : openEntry());

  // The value and the change open the history; "Eintragen" sits beside them, not inside, so
  // screen readers reach it on its own.
  return (
    <View className="mx-4 mt-4 overflow-hidden rounded-[22px] bg-surface">
      <View className="flex-row items-center gap-3 pt-4 pr-5 pb-1">
        <PressableScale
          haptic="tap"
          activeScale={0.98}
          accessibilityRole="button"
          onPress={open}
          className="min-w-0 flex-1 gap-1 pl-5"
        >
          <Text variant="overline" tone="subtle" className="text-[11px]">
            {t('open')}
          </Text>
          {latest ? (
            <View className="flex-row items-baseline gap-1">
              <Text
                tone="accent"
                className="font-inter-semibold text-[28px] leading-8 tabular-nums"
              >
                {formatKg(latest.trendKg, units)}
              </Text>
              <Text tone="muted" className="font-inter-semibold text-sm">
                {`${unit} · ${t('history.trend')}`}
              </Text>
            </View>
          ) : (
            <Text variant="caption" tone="subtle" className="font-inter-medium">
              {t('history.empty')}
            </Text>
          )}
        </PressableScale>
        <Button
          label={t('card.add')}
          icon="plus"
          size="sm"
          variant="secondary"
          onPress={openEntry}
        />
      </View>
      {change ? (
        <PressableScale haptic="tap" activeScale={0.98} onPress={open}>
          <TrendChangeRow change={change} units={units} />
        </PressableScale>
      ) : (
        <View className="h-3" />
      )}
    </View>
  );
}
