import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { type UnitSystem, weightUnit } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { formatBodyWeight, formatChange } from '../../lib/format';

/** A home box: the surface of the coach card above it; a tap opens the weight history. */
export function WeightCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <PressableScale
      haptic="tap"
      activeScale={0.98}
      onPress={() => router.push('/body-weight')}
      className={cn('overflow-hidden rounded-[18px] bg-surface', className)}
    >
      {children}
    </PressableScale>
  );
}

/** "82,4 kg": the trend, large, its unit small beside it. */
export function WeightValue({
  kg,
  units,
  size = 28,
  accent,
}: {
  kg: number;
  units: UnitSystem;
  size?: number;
  accent?: boolean;
}) {
  return (
    <View className="flex-row items-baseline gap-1">
      <Text
        className={cn('font-inter-semibold tabular-nums', accent ? 'text-accent' : 'text-fg')}
        style={{ fontSize: size, lineHeight: Math.round(size * 1.15) }}
      >
        {formatBodyWeight(kg, units)}
      </Text>
      <Text tone="muted" className="font-inter-semibold text-[13px]">
        {weightUnit(units)}
      </Text>
    </View>
  );
}

/** "−0,4 kg" with an arrow; neutral colours, whether down is good depends on the goal. */
export function ChangeText({
  kg,
  units,
  suffix,
}: {
  kg: number | null;
  units: UnitSystem;
  suffix?: string;
}) {
  if (kg === null) return <Text className="font-inter text-[13px] text-subtle">–</Text>;
  const value = formatChange(kg, units);
  const icon = value.startsWith('−') ? 'trend-down' : value.startsWith('+') ? 'trend-up' : null;
  return (
    <View className="flex-row items-center gap-1">
      {icon ? <Icon name={icon} size={13} color={colors.muted} /> : null}
      <Text className="font-inter-semibold text-[13px] text-fg-2 tabular-nums">
        {`${value} ${weightUnit(units)}`}
        {suffix ? (
          <Text className="font-inter text-[13px] text-subtle">{` · ${suffix}`}</Text>
        ) : null}
      </Text>
    </View>
  );
}

/** A small caps label over a value. */
export function Overline({ children, accent }: { children: string; accent?: boolean }) {
  return (
    <Text variant="overline" tone={accent ? 'accent' : 'subtle'} className="text-[11px]">
      {children}
    </Text>
  );
}
