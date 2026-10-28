import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { formatWeight, type UnitSystem } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import type { MissNotice } from '../lib/set-suggestions';

export interface MissCardProps {
  miss: MissNotice;
  units: UnitSystem;
  /** Keeps the open sets at the planned weight. */
  onKeep: () => void;
}

/** After a set fell well short: the open sets got lighter, with a way to stay at the plan. */
export function MissCard({ miss, units, onKeep }: MissCardProps) {
  const { t } = useTranslation('workout');
  return (
    <View className="mx-5 mt-4 flex-row items-start gap-3 rounded-2xl border border-white/8 bg-surface px-3.5 py-3">
      <View className="size-7.5 items-center justify-center rounded-full bg-amber">
        <Icon name="arrow-down" size={12} color={colors.onAccent} />
      </View>
      <View className="flex-1 gap-1">
        <Text variant="label" className="leading-5">
          {t('miss.title', { reps: miss.reps, target: miss.target })}
        </Text>
        <Text tone="muted" className="font-inter text-sm leading-4.75">
          {t('miss.body', {
            count: miss.open,
            weight: formatWeight(miss.toKg, units),
            reps: miss.toReps,
          })}
        </Text>
        <PressableScale haptic="select" hitSlop={8} onPress={onKeep} className="mt-1 self-start">
          <Text variant="label" className="text-sm underline">
            {t('miss.keep', { weight: formatWeight(miss.fromKg, units) })}
          </Text>
        </PressableScale>
      </View>
    </View>
  );
}
