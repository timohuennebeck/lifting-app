import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useUnits } from '@/shared/data/profile';
import { useWeightEntries } from '@/shared/data/weight-entries';
import { toIsoDate } from '@/shared/lib/date';
import { Button } from '@/shared/ui/button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { formatKg } from '../lib/format';
import { trendChange, withTrend } from '../lib/trend';
import { TrendChangeRow } from './trend-change-row';

/** Days the card's change and sparkline cover. */
const CHANGE_DAYS = 30;

/**
 * Weight at the top of Fortschritt → Körper: the trend now and how it moved over the last 30
 * days; opens the history (with its calendar), "Eintragen" today's weigh-in.
 */
export function WeightCard() {
  const { t } = useTranslation(['weight', 'common']);
  const units = useUnits();
  const unit = t(`common:units.${units === 'imperial' ? 'lb' : 'kg'}`);
  const { entries, isLoading } = useWeightEntries();
  const points = withTrend(entries);
  const today = toIsoDate(new Date());
  const latest = points.at(-1);
  const change = trendChange(points, today, CHANGE_DAYS);
  if (isLoading) return null;

  const openEntry = () => router.push({ pathname: '/body-weight/[date]', params: { date: today } });

  return (
    <PressableScale
      haptic="tap"
      activeScale={0.98}
      accessibilityRole="button"
      onPress={() => (latest ? router.push('/body-weight') : openEntry())}
      className="mx-4 mt-4 overflow-hidden rounded-[22px] bg-surface"
    >
      <View className="flex-row items-center gap-3 px-5 pt-4 pb-1">
        <View className="min-w-0 flex-1 gap-1">
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
        </View>
        <Button
          label={t('card.add')}
          icon="plus"
          size="sm"
          variant="secondary"
          onPress={openEntry}
        />
      </View>
      {change ? <TrendChangeRow change={change} units={units} /> : <View className="h-3" />}
    </PressableScale>
  );
}
