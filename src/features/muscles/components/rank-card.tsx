import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { Text } from '@/shared/ui/text';

import { TIERS, tierOf } from '../lib/levels';
import { filled, RankSegments } from './rank-segments';

export interface RankCardProps {
  /** The overall level, whole. */
  level: number;
  /** Under the way to the next rank, e.g. the Level tab's "Übersicht". */
  children?: ReactNode;
  className?: string;
}

/** "Dein Rang": the rank the overall level is in, the level and the way to the next rank. */
export function RankCard({ level, children, className }: RankCardProps) {
  const { t } = useTranslation('muscles');
  const index = TIERS.findIndex((r) => r.tier === tierOf(Math.max(level, 1)));
  const current = TIERS[index];
  const next = TIERS[index + 1];

  return (
    <View className={cn('gap-3.5 rounded-[18px] bg-surface p-5', className)}>
      <View className="flex-row items-end justify-between gap-3">
        {/* The overline sits on the rank's name, not on the taller level beside it. */}
        <View className="shrink gap-1">
          <Text variant="overline" tone="subtle" className="text-[11px]">
            {t('ranks.yours')}
          </Text>
          <Text
            numberOfLines={1}
            className="font-inter-semibold text-[30px] leading-9 tracking-[-0.5px]"
          >
            {t(`level.tiers.${current.tier}`)}
          </Text>
        </View>
        <View className="flex-row items-baseline gap-1">
          <Text className="font-inter-semibold text-[48px] leading-[50px] tabular-nums">
            {level}
          </Text>
          <Text className="font-inter-medium text-lg text-dim">/100</Text>
        </View>
      </View>
      <RankSegments lit={filled(level, current.from, current.to)} className="h-1.5" />
      <View className="flex-row justify-between gap-3">
        <Text variant="caption" tone="subtle" className="font-inter-medium">
          {t('ranks.levelShort', { level: current.from })}
        </Text>
        <Text variant="caption" tone="subtle" className="font-inter-medium">
          {next
            ? t('ranks.toNext', { levels: next.from - level, tier: t(`level.tiers.${next.tier}`) })
            : t('ranks.top')}
        </Text>
      </View>
      {children}
    </View>
  );
}
