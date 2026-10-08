import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { formatNumber, formatWeight, type UnitSystem } from '@/shared/lib/format';
import { Text } from '@/shared/ui/text';

import { compareVolume } from '../lib/compare';

const tonnage = (kg: number, units: UnitSystem) =>
  units === 'metric' && kg >= 1000 ? `${formatNumber(kg / 1000, 1)} t` : formatWeight(kg, units);

export interface VolumeComparisonProps {
  volumeKg: number;
  units: UnitSystem;
}

/** "That's like lifting 6 giraffes" – fun scale for the session volume. */
export function VolumeComparison({ volumeKg, units }: VolumeComparisonProps) {
  const { t } = useTranslation('workout');
  const { animal, ratio } = compareVolume(volumeKg);
  const count = ratio >= 1 ? Math.floor(ratio) : Math.round(ratio * 10) / 10;
  const key = `compare.animals.${animal.id}` as const;

  return (
    <View className="gap-2 rounded-[28px] border border-white/8 bg-surface p-5">
      <Text variant="overline" tone="subtle">
        {t('compare.title')}
      </Text>
      <Text variant="title" tone="accent">
        {t(key, { count, value: formatNumber(count, 1) })}
      </Text>
      <Text variant="label" tone="subtle" className="font-inter">
        {t('compare.caption', {
          volume: tonnage(volumeKg, units),
          one: t(key, { count: 1, value: formatNumber(1) }),
          weight: tonnage(animal.kg, units),
        })}
      </Text>
    </View>
  );
}
