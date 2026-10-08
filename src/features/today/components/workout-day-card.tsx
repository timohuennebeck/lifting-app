import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { MuscleShare } from '@/shared/data/muscles';
import { colors, useAccentColor } from '@/shared/lib/theme';
import { Card } from '@/shared/ui/card';
import { Icon, type IconName } from '@/shared/ui/icon';
import { MuscleMap } from '@/shared/ui/muscle-map';
import { Text } from '@/shared/ui/text';

export interface DayStat {
  icon: IconName;
  label: string;
  accent?: boolean;
}

export interface WorkoutDayCardProps {
  /** Status row at the top (badge + label, optional trailing). */
  status: ReactNode;
  name: string;
  shares: MuscleShare[];
  stats: DayStat[];
  actions: ReactNode;
}

/** Card layout shared by the done and planned states of the Today tab. */
export function WorkoutDayCard({ status, name, shares, stats, actions }: WorkoutDayCardProps) {
  const { t } = useTranslation('muscles');
  const accent = useAccentColor();
  const muscles = shares.map((s) => s.muscle);
  const summary = shares
    .slice(0, 3)
    .map((s) => t(`names.${s.muscle}`))
    .join(' · ');

  return (
    <Card className="mx-4 gap-[18px] bg-[#151515]">
      {status}
      <View className="h-[220px] flex-row justify-center gap-2">
        <View className="h-full w-[140px]">
          <MuscleMap view="front" selected={muscles} />
        </View>
        <View className="h-full w-[140px]">
          <MuscleMap view="back" selected={muscles} />
        </View>
      </View>
      <View className="gap-1.5">
        <Text variant="headline" className="text-[28px] leading-[28px] tracking-[-0.3px]">
          {name}
        </Text>
        {summary ? (
          <Text tone="muted" className="text-sm">
            {summary}
          </Text>
        ) : null}
      </View>
      <View className="flex-row flex-wrap items-center gap-4">
        {stats.map((stat) => (
          <View key={stat.label} className="flex-row items-center gap-1.5">
            <Icon
              name={stat.icon}
              size={stat.icon === 'dumbbell' ? 18 : 13}
              color={stat.accent ? accent : colors.subtle}
            />
            <Text variant="caption" tone={stat.accent ? 'accent' : 'secondary'} className="text-sm">
              {stat.label}
            </Text>
          </View>
        ))}
      </View>
      {actions}
    </Card>
  );
}
